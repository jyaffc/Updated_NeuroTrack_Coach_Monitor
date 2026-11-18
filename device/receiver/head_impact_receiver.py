# =============================================================================
# head_impact_receiver.py
# Python BLE Receiver - Head Impact Monitor
#
# Purpose:
#   Receives 47-byte BLE packets from the ESP32 HeadImpactMonitor sketch,
#   shows a live 3D head model that follows the wearer's head, detects impacts,
#   and writes a CSV that the NeuroTrack dashboard's Intake page loads directly.
#
# Required libraries:
#   python -m pip install bleak numpy matplotlib
#   (use the same Python that runs this script, e.g. Anaconda's python.exe)
#
# Usage:
#   1. Power on the ESP32 and calibrate it (see the Serial Monitor)
#   2. Run: python head_impact_receiver.py
#   3. Enter the athlete name and head size, then put the headband on
#   4. When connected, look straight ahead: the model is zeroed ("tared")
#      automatically after 3 seconds. Press T in the 3D window to re-zero.
#   5. Close the window or press Ctrl+C to end the session
#
# Output (in the folder you run the script from):
#   impact_log_<date>_<time>.csv   one row per impact, written as it happens
#   impact_log_<date>_<time>.json  session summary (dashboard can read it too)
#
# Axes used everywhere after the tare (head frame):
#   +X = wearer's right, +Y = forward (out of the face), +Z = up
# =============================================================================

import asyncio
import csv
import datetime
import json
import struct
import threading
import time

import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d.art3d import Poly3DCollection   # 3D polygons for the head
from bleak import BleakClient, BleakScanner

# =============================================================================
# CONFIGURATION - BLE values must match HeadImpactMonitor.ino exactly
# =============================================================================

BLE_DEVICE_NAME = "HeadImpactMonitor"
CHAR_UUID_IMU   = "abcd1234-ab12-ab12-ab12-abcdef123456"

# Packet layout: 10 float32, uint32 timestamp, uint16 sequence, uint8 calibration
PACKET_FORMAT = "<10fIHB"
PACKET_SIZE   = struct.calcsize(PACKET_FORMAT)   # 47 bytes

G = 9.80665   # Standard gravity, m/s^2 per g

# An impact starts when net acceleration exceeds this (m/s^2, gravity removed)
# 14.7 m/s^2 = 1.5 g. Tune it after testing on a real wearer.
IMPACT_THRESHOLD_MS2 = 14.7

# An impact ends once acceleration stays below threshold for this long (ms).
# All samples in between count as ONE hit, so the CSV gets one row per impact.
EVENT_END_GAP_MS = 100

# The BNO055 caps acceleration at +/-4 g in fusion mode; readings near this
# are flagged because the true peak was probably higher
SENSOR_LIMIT_G = 4.0

# Seconds after connecting before the automatic tare (wearer looks ahead)
AUTO_TARE_DELAY_S = 3.0

# Which sensor axis points FORWARD (out of the forehead) when the board is
# worn. [0, 0, 1] = BNO055 board flat on the forehead, chip side facing out.
# If nodding "yes" shows up as a sideways tilt on the model, the board is
# mounted differently: try [0, 0, -1], [1, 0, 0], or [0, 1, 0].
SENSOR_FORWARD_AXIS = np.array([0.0, 0.0, 1.0])

# Default head size (cm): X = width, Y = front-back depth, Z = height
HEAD_WIDTH_CM  = 15.0
HEAD_DEPTH_CM  = 19.0
HEAD_HEIGHT_CM = 23.0

# Where the sensor sits on the forehead, as a fraction of the head's half-height
# above the head's center (0.35 is roughly mid-forehead)
SENSOR_HEIGHT_FRACTION = 0.35


# =============================================================================
# QUATERNION AND VECTOR MATH
# =============================================================================
def quaternion_to_rotation_matrix(q):
    """
    Convert a unit quaternion [w, x, y, z] to a 3x3 rotation matrix.
    R maps sensor-frame vectors into the BNO055's world frame (Z up).
    """
    w, x, y, z = q / np.linalg.norm(q)   # re-normalize to remove float drift
    xx, yy, zz = x * x, y * y, z * z
    xy, xz, yz = x * y, x * z, y * z
    wx, wy, wz = w * x, w * y, w * z
    return np.array([
        [1 - 2 * (yy + zz), 2 * (xy - wz),     2 * (xz + wy)],
        [2 * (xy + wz),     1 - 2 * (xx + zz), 2 * (yz - wx)],
        [2 * (xz - wy),     2 * (yz + wx),     1 - 2 * (xx + yy)],
    ])


def sensor_to_head_matrix(q_neutral, forward_axis=SENSOR_FORWARD_AXIS):
    """
    Build the fixed rotation from sensor axes to head axes, from one quaternion
    captured while the wearer looks straight ahead (the tare).

    Up comes from gravity (exact). Forward is the mounting axis with its
    vertical part removed. Right = forward x up completes a right-handed frame.

    Returns:
        3x3 matrix H with v_head = H @ v_sensor, or None if the forward axis
        is nearly vertical (wrong SENSOR_FORWARD_AXIS for this mounting).
    """
    R0 = quaternion_to_rotation_matrix(q_neutral)
    up = R0.T @ np.array([0.0, 0.0, 1.0])          # world up, in sensor axes
    fwd = forward_axis - np.dot(forward_axis, up) * up
    if np.linalg.norm(fwd) < 0.3:
        return None
    fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, up)                       # +X = right (X = Y x Z)
    return np.vstack([right, fwd, up])              # rows = head axes in sensor axes


def impact_side(accel_head):
    """
    Side of the head the hit came from, using the dashboard's labels.
    A hit pushes the head AWAY from the contact point, so the contact side is
    opposite to the acceleration (forehead hit -> head accelerates backward).
    """
    impact = -np.asarray(accel_head)
    ax, ay, az = np.abs(impact)
    if ax >= ay and ax >= az:
        return "Right lateral" if impact[0] > 0 else "Left lateral"
    if ay >= ax and ay >= az:
        return "Frontal" if impact[1] > 0 else "Posterior"
    return "Crown" if impact[2] > 0 else "Frontal"   # chin hits grouped as frontal


def unpack_calibration(byte_value):
    """Split the packed calibration byte into (sys, gyro, accel, mag), each 0-3."""
    return ((byte_value >> 6) & 3, (byte_value >> 4) & 3,
            (byte_value >> 2) & 3, byte_value & 3)


# =============================================================================
# SESSION: impact detection, tare, and logging (no BLE or plotting in here,
# so the same logic can be tested with simulated packets)
# =============================================================================
class ImpactSession:
    def __init__(self, player_name, session_id, head_cm, csv_path):
        self.player_name = player_name
        self.session_id  = session_id
        self.csv_path    = csv_path
        self.lock        = threading.Lock()

        # Sensor position relative to the head center, in head axes (meters).
        # The ellipsoid center is used as an approximation of the head's
        # center of mass.
        rx, ry, rz = (np.asarray(head_cm, dtype=float) / 2.0) / 100.0
        h = SENSOR_HEIGHT_FRACTION
        self.sensor_offset_m = np.array([0.0, ry * np.sqrt(1 - h * h), rz * h])

        # Latest values for the 3D view
        self.latest_q        = np.array([1.0, 0.0, 0.0, 0.0])
        self.latest_accel_g  = 0.0
        self.latest_cal      = (0, 0, 0, 0)
        self.latest_ms       = 0

        # Tare state: H maps sensor axes to head axes (identity until tared)
        self.H          = np.eye(3)
        self.q_neutral  = None
        self.tared      = False
        self.tare_requested = False

        # Packet bookkeeping
        self.packets       = 0
        self.dropped       = 0
        self.last_sequence = None
        self.prev_gyro_rad = None
        self.prev_ms       = None

        # Impact detection state
        self.active_event   = None
        self.impacts        = []        # finished impacts (dicts)

        # CSV columns: names the dashboard recognizes come first
        self.columns = [
            "sessionId", "playerName", "timestamp", "esp32_timestamp_ms",
            "eventIntensity", "magnitude_ms2", "eventDirection",
            "direction_x", "direction_y", "direction_z", "eventType",
            "head_center_g", "peak_rot_vel_dps", "peak_rot_acc_rads2",
            "duration_ms", "samples", "at_sensor_limit", "tared", "calibration",
        ]
        self.csv_file   = open(csv_path, "w", newline="")
        self.csv_writer = csv.writer(self.csv_file)
        self.csv_writer.writerow(self.columns)
        self.csv_file.flush()

    # ------------------------------------------------------------------ tare
    def request_tare(self):
        """Ask for a tare on the next packet (called from the window or timer)."""
        self.tare_requested = True

    def _apply_tare(self, q):
        H = sensor_to_head_matrix(q)
        if H is None:
            print("[TARE] Failed: SENSOR_FORWARD_AXIS points almost straight up or down.")
            print("       Change SENSOR_FORWARD_AXIS at the top of this script.")
            return
        self.H, self.q_neutral, self.tared = H, q.copy(), True
        print("[TARE] Zeroed. Head axes: +X right, +Y forward, +Z up.")

    def display_rotation(self):
        """
        Rotation for the 3D model. After the tare it is the head's rotation
        relative to the neutral pose, expressed in head axes; before the tare
        it is the raw sensor orientation.
        """
        with self.lock:
            q, H, q0 = self.latest_q.copy(), self.H.copy(), self.q_neutral
        R = quaternion_to_rotation_matrix(q)
        if q0 is None:
            return R
        R0 = quaternion_to_rotation_matrix(q0)
        # world <- head now = R @ H.T ; world <- head at tare = R0 @ H.T
        return (R0 @ H.T).T @ (R @ H.T)

    # ---------------------------------------------------------------- packets
    def process_packet(self, raw):
        """Unpack one BLE packet and update orientation, tare, and impacts."""
        if len(raw) != PACKET_SIZE:
            print(f"[WARN] Packet is {len(raw)} bytes, expected {PACKET_SIZE}. "
                  "Upload the matching ESP32 sketch.")
            return
        values = struct.unpack(PACKET_FORMAT, raw)
        q      = np.array(values[0:4])
        accel  = np.array(values[4:7])                 # m/s^2, sensor axes
        gyro   = np.array(values[7:10])                # deg/s, sensor axes
        ms, sequence, cal_byte = values[10], values[11], values[12]
        self.process_sample(q, accel, gyro, ms, sequence, unpack_calibration(cal_byte))

    def process_sample(self, q, accel_sensor, gyro_sensor_dps, ms, sequence, cal):
        # Dropped packets: the sequence number should go up by exactly 1
        if self.last_sequence is not None:
            gap = (sequence - self.last_sequence) % 65536
            if gap > 1:
                self.dropped += gap - 1
        self.last_sequence = sequence
        self.packets += 1

        if self.tare_requested:
            self.tare_requested = False
            self._apply_tare(q)

        # Rotate into head axes (identity until tared)
        accel = self.H @ accel_sensor
        omega = np.radians(self.H @ gyro_sensor_dps)    # rad/s

        # Angular acceleration from the change in angular velocity (rad/s^2)
        alpha = np.zeros(3)
        if self.prev_gyro_rad is not None and self.prev_ms is not None:
            dt = (ms - self.prev_ms) / 1000.0
            if 0 < dt < 0.1:
                alpha = (omega - self.prev_gyro_rad) / dt
        self.prev_gyro_rad, self.prev_ms = omega, ms

        # Acceleration at the head center (rigid body):
        #   a_sensor = a_center + alpha x r + omega x (omega x r)
        r = self.sensor_offset_m
        accel_center = accel - np.cross(alpha, r) - np.cross(omega, np.cross(omega, r))

        magnitude = float(np.linalg.norm(accel))
        with self.lock:
            self.latest_q, self.latest_accel_g = q, magnitude / G
            self.latest_cal, self.latest_ms = cal, ms

        self._update_impact(ms, accel, magnitude, accel_center, omega, alpha, cal)

    # ---------------------------------------------------------------- impacts
    def _update_impact(self, ms, accel, magnitude, accel_center, omega, alpha, cal):
        event = self.active_event
        above = magnitude > IMPACT_THRESHOLD_MS2

        if event is None and not above:
            return
        if event is None:
            event = self.active_event = {
                "start_ms": ms, "last_above_ms": ms, "samples": 0,
                "peak_ms2": 0.0, "peak_vector": accel, "peak_ms": ms,
                "peak_center_ms2": 0.0, "peak_rot_vel": 0.0, "peak_rot_acc": 0.0,
                "wall_time": datetime.datetime.now(), "cal": cal,
            }

        # Keep the strongest values seen during the hit
        event["samples"] += 1
        if above:
            event["last_above_ms"] = ms
        if magnitude > event["peak_ms2"]:
            event.update(peak_ms2=magnitude, peak_vector=accel, peak_ms=ms,
                         wall_time=datetime.datetime.now())
        event["peak_center_ms2"] = max(event["peak_center_ms2"], float(np.linalg.norm(accel_center)))
        event["peak_rot_vel"] = max(event["peak_rot_vel"], float(np.degrees(np.linalg.norm(omega))))
        event["peak_rot_acc"] = max(event["peak_rot_acc"], float(np.linalg.norm(alpha)))

        if not above and ms - event["last_above_ms"] >= EVENT_END_GAP_MS:
            self.finish_impact()

    def finish_impact(self):
        """Write the current impact (if any) as one CSV row."""
        event, self.active_event = self.active_event, None
        if event is None or self.csv_file.closed:
            return   # nothing to write, or the session has already been closed

        peak_g = event["peak_ms2"] / G
        direction = event["peak_vector"] / max(event["peak_ms2"], 1e-9)
        side = impact_side(direction)
        at_limit = peak_g >= SENSOR_LIMIT_G * 0.975
        row = {
            "sessionId": self.session_id,
            "playerName": self.player_name,
            "timestamp": event["wall_time"].isoformat(timespec="milliseconds"),
            "esp32_timestamp_ms": event["peak_ms"],
            "eventIntensity": f"{peak_g:.3f}",
            "magnitude_ms2": f"{event['peak_ms2']:.3f}",
            "eventDirection": side,
            "direction_x": f"{direction[0]:.4f}",
            "direction_y": f"{direction[1]:.4f}",
            "direction_z": f"{direction[2]:.4f}",
            "eventType": "Headband impact",
            "head_center_g": f"{event['peak_center_ms2'] / G:.3f}",
            "peak_rot_vel_dps": f"{event['peak_rot_vel']:.1f}",
            "peak_rot_acc_rads2": f"{event['peak_rot_acc']:.0f}",
            "duration_ms": event["last_above_ms"] - event["start_ms"] + 10,
            "samples": event["samples"],
            "at_sensor_limit": "yes" if at_limit else "no",
            "tared": "yes" if self.tared else "no",
            "calibration": "S{}G{}A{}M{}".format(*event["cal"]),
        }
        with self.lock:
            self.impacts.append(row)
            self.csv_writer.writerow([row[column] for column in self.columns])
            self.csv_file.flush()   # saved immediately, so a crash loses nothing

        limit_note = "  (at 4 g sensor limit, true peak may be higher)" if at_limit else ""
        print(f"[IMPACT] {row['timestamp']} | {peak_g:.2f} g | {side} | "
              f"rot {event['peak_rot_vel']:.0f} deg/s{limit_note}")

    def close(self):
        """Finish any impact in progress and write the session summary JSON."""
        self.finish_impact()
        with self.lock:
            self.csv_file.close()
            peaks = [float(row["eventIntensity"]) for row in self.impacts]
            summary = {
                # Key names the dashboard's JSON intake already understands
                "session_id": self.session_id,
                "player_python": self.player_name,
                "threshold_g": round(IMPACT_THRESHOLD_MS2 / G, 3),
                "total_events": len(self.impacts),
                "max_g": round(max(peaks), 3) if peaks else 0,
                "mean_g": round(float(np.mean(peaks)), 3) if peaks else 0,
                "packets_received": self.packets,
                "packets_dropped": self.dropped,
                "csv_file": self.csv_path,
            }
        json_path = self.csv_path.rsplit(".", 1)[0] + ".json"
        with open(json_path, "w") as f:
            json.dump(summary, f, indent=2)

        print(f"\n[LOG] {len(self.impacts)} impacts saved to {self.csv_path}")
        if peaks:
            print(f"      Max {summary['max_g']} g, mean {summary['mean_g']} g")
        print(f"      Packets: {self.packets} received, {self.dropped} dropped")
        print(f"      Summary: {json_path}")


# =============================================================================
# BLE RECEIVER (runs in a background thread; reconnects automatically)
# =============================================================================
class BleLink:
    def __init__(self, session):
        self.session   = session
        self.running   = True
        self.connected = False
        self.connected_since = None
        self.thread = threading.Thread(target=lambda: asyncio.run(self._run()), daemon=True)

    def start(self):
        self.thread.start()

    def stop(self):
        self.running = False
        self.thread.join(timeout=5.0)

    def _on_notify(self, _sender, data):
        self.session.process_packet(bytes(data))

    async def _run(self):
        while self.running:
            print(f"[BLE] Scanning for '{BLE_DEVICE_NAME}'...")
            device = await BleakScanner.find_device_by_name(BLE_DEVICE_NAME, timeout=10.0)
            if device is None:
                if self.running:
                    print("[BLE] Not found yet. Is the ESP32 powered on? Retrying...")
                continue

            disconnected = asyncio.Event()
            try:
                async with BleakClient(device, disconnected_callback=lambda _c: disconnected.set()) as client:
                    print(f"[BLE] Connected to {device.address} (MTU {client.mtu_size})")
                    await client.start_notify(CHAR_UUID_IMU, self._on_notify)
                    self.connected, self.connected_since = True, time.time()
                    if not self.session.tared:
                        print(f"[TARE] Look straight ahead - zeroing in {AUTO_TARE_DELAY_S:.0f} s")
                    while self.running and not disconnected.is_set():
                        await asyncio.sleep(0.1)
                    if client.is_connected:
                        await client.stop_notify(CHAR_UUID_IMU)
            except Exception as error:   # connection dropped mid-setup, adapter busy, ...
                print(f"[BLE] Connection error: {error}")
            finally:
                self.connected = False
                self.session.finish_impact()   # don't merge hits across a reconnect

            if self.running:
                print("[BLE] Disconnected. Reconnecting...")
                await asyncio.sleep(1.0)


# =============================================================================
# 3D VIEW (main thread)
# =============================================================================
def build_head_mesh(head_cm, resolution=28):
    """
    Ellipsoid head as quad faces.
    Parameterization: x = rx sin(phi) cos(theta), y = ry sin(phi) sin(theta),
    z = rz cos(phi), with phi in [0, pi] and theta in [0, 2 pi].

    Returns:
        points (3, N) vertex array and faces (F, 4) vertex-index array
    """
    rx, ry, rz = np.asarray(head_cm, dtype=float) / 2.0
    phi, theta = np.meshgrid(np.linspace(0, np.pi, resolution),
                             np.linspace(0, 2 * np.pi, resolution), indexing="ij")
    points = np.vstack([(rx * np.sin(phi) * np.cos(theta)).ravel(),
                        (ry * np.sin(phi) * np.sin(theta)).ravel(),
                        (rz * np.cos(phi)).ravel()])
    i, j = np.meshgrid(np.arange(resolution - 1), np.arange(resolution - 1), indexing="ij")
    corner = (i * resolution + j).ravel()
    faces = np.stack([corner, corner + resolution, corner + resolution + 1, corner + 1], axis=1)
    return points, faces


def shade(face_vertices, base_rgb):
    """Simple lighting: brighter where a face points toward the light."""
    normals = np.cross(face_vertices[:, 2] - face_vertices[:, 0],
                       face_vertices[:, 3] - face_vertices[:, 1])
    lengths = np.linalg.norm(normals, axis=1, keepdims=True)
    normals = normals / np.where(lengths == 0, 1, lengths)
    light = np.array([0.4, -0.6, 0.7]) / np.linalg.norm([0.4, -0.6, 0.7])
    brightness = 0.35 + 0.65 * np.clip(np.abs(normals @ light), 0, 1)
    colors = np.empty((len(face_vertices), 4))
    colors[:, :3] = np.clip(np.outer(brightness, base_rgb), 0, 1)
    colors[:, 3] = 0.9
    return colors


def run_view(session, link, head_cm):
    points, faces = build_head_mesh(head_cm)
    rx, ry, rz = np.asarray(head_cm, dtype=float) / 2.0
    # Markers on the model: nose (front), sensor on the forehead, facing arrow
    nose        = np.array([0.0, ry * 1.08, -rz * 0.1])
    sensor_dot  = session.sensor_offset_m * 100.0          # back to cm
    facing_tip  = np.array([0.0, ry * 1.6, 0.0])

    fig = plt.figure(figsize=(9, 7))
    fig.patch.set_facecolor("#1a1a2e")
    ax = fig.add_subplot(111, projection="3d")
    ax.set_facecolor("#1a1a2e")
    limit = float(max(rx, ry, rz)) * 1.7
    ax.set_xlim(-limit, limit); ax.set_ylim(-limit, limit); ax.set_zlim(-limit, limit)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=15, azim=60)        # camera in front of and right of the face
    ax.computed_zorder = False            # draw markers on top of the head
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.set_pane_color((0.12, 0.12, 0.2, 1.0))
    ax.set_xlabel("X  right (cm)", color="#cccccc")
    ax.set_ylabel("Y  forward (cm)", color="#cccccc")
    ax.set_zlabel("Z  up (cm)", color="#cccccc")
    ax.tick_params(colors="#888888")
    ax.set_title("Head Impact Monitor - live orientation   (press T to re-zero)",
                 color="white", fontsize=11, pad=12)

    skin, red = np.array([0.78, 0.66, 0.51]), np.array([1.0, 0.2, 0.2])
    head = Poly3DCollection(points.T[faces], linewidths=0, zorder=1)
    ax.add_collection3d(head)
    nose_dot,   = ax.plot([], [], [], "o", color="#ffffff", markersize=7, zorder=3)
    sensor_mk,  = ax.plot([], [], [], "s", color="#33ddff", markersize=7, zorder=3)
    facing_ln,  = ax.plot([], [], [], "-", color="#33ddff", linewidth=2, zorder=2)

    status = fig.text(0.02, 0.97, "", color="#ffcc44", fontsize=9, va="top", family="monospace")
    counter = fig.text(0.98, 0.97, "", color="#ff6666", fontsize=9, va="top", ha="right",
                       family="monospace")
    flash = {"frames": 0, "count": 0}

    def update(_frame):
        # Automatic tare a few seconds after the first connection
        if (link.connected and not session.tared and not session.tare_requested
                and link.connected_since and time.time() - link.connected_since > AUTO_TARE_DELAY_S):
            session.request_tare()

        R = session.display_rotation()
        moved = R @ points
        face_vertices = moved.T[faces]

        count = len(session.impacts)
        if count > flash["count"]:
            flash.update(frames=6, count=count)
        base = red if flash["frames"] > 0 else skin
        flash["frames"] = max(0, flash["frames"] - 1)

        head.set_verts(face_vertices)          # update in place: no redraw of a new surface
        head.set_facecolor(shade(face_vertices, base))
        n, s, f = R @ nose, R @ sensor_dot, R @ facing_tip
        nose_dot.set_data_3d([n[0]], [n[1]], [n[2]])
        sensor_mk.set_data_3d([s[0]], [s[1]], [s[2]])
        facing_ln.set_data_3d([n[0], f[0]], [n[1], f[1]], [n[2], f[2]])

        with session.lock:
            accel_g, cal = session.latest_accel_g, session.latest_cal
        if link.connected:
            tare_text = "zeroed" if session.tared else "not zeroed - look ahead"
            status.set_text(f"Connected | {accel_g:4.2f} g | cal S{cal[0]} G{cal[1]} A{cal[2]} M{cal[3]}"
                            f" | {tare_text} | dropped {session.dropped}")
            status.set_color("#44ff88" if session.tared else "#ffcc44")
        else:
            status.set_text("Searching for the headband...")
            status.set_color("#ffcc44")
        counter.set_text(f"Impacts: {count}")
        return head, nose_dot, sensor_mk, facing_ln

    def on_key(event):
        if event.key in ("t", "T"):
            session.request_tare()
            print("[TARE] Re-zeroing on the next packet - keep looking straight ahead")

    fig.canvas.mpl_connect("key_press_event", on_key)
    # Keep a reference so the animation is not garbage-collected
    fig._animation = animation.FuncAnimation(fig, update, interval=33, blit=False,
                                             cache_frame_data=False)
    plt.show()   # blocks until the window is closed


# =============================================================================
# MAIN
# =============================================================================
def ask(prompt, default):
    answer = input(f"{prompt} [{default}]: ").strip()
    return answer or default


def ask_float(prompt, default):
    try:
        return float(ask(prompt, default))
    except ValueError:
        print("  Not a number, using the default.")
        return default


if __name__ == "__main__":
    print("=" * 62)
    print("  Head Impact Monitor - Python Receiver")
    print(f"  Impact threshold: {IMPACT_THRESHOLD_MS2} m/s^2 ({IMPACT_THRESHOLD_MS2 / G:.2f} g)")
    print("=" * 62)

    started = datetime.datetime.now()
    player = ask("Athlete name", "Headband wearer")
    session_id = ask("Session name", started.strftime("session-%Y-%m-%d-%H%M"))
    head_cm = (ask_float("Head width  (cm, left-right)", HEAD_WIDTH_CM),
               ask_float("Head depth  (cm, front-back)", HEAD_DEPTH_CM),
               ask_float("Head height (cm, top-bottom)", HEAD_HEIGHT_CM))

    csv_path = started.strftime("impact_log_%Y-%m-%d_%H-%M-%S.csv")
    session = ImpactSession(player, session_id, head_cm, csv_path)
    link = BleLink(session)
    link.start()
    print(f"[LOG] Writing impacts to {csv_path}\n")

    try:
        run_view(session, link, head_cm)
    except KeyboardInterrupt:
        print("\n[MAIN] Ctrl+C received.")
    finally:
        link.stop()
        session.close()
        print("[MAIN] Session ended. Upload the CSV on the dashboard's Intake page.")
