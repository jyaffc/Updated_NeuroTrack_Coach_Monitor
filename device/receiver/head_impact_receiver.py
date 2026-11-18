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
#   3. Enter the athlete name, session name, and head size
#   4. In the window (first time with a headband, or after re-mounting it):
#        a. Calibrate axes -> follow the 4 steps, clicking Capture after each
#        b. Place sensor   -> click where the sensor sits on the Front or Top view
#      Both are saved in headband_setup.json and reloaded next time.
#   5. Zero head (or T) any time the wearer looks straight ahead
#   6. Save & quit (or close the window) to end the session
#
# Output (in the folder you run the script from):
#   impact_log_<date>_<time>.csv   one row per impact, written as it happens
#   impact_log_<date>_<time>.json  session summary (dashboard can read it too)
#   headband_setup.json            axis calibration and sensor placement
#
# Axes used everywhere once the axes are set up (head frame):
#   +X = wearer's right, +Y = forward (out of the face), +Z = up
# =============================================================================

import asyncio
import csv
import datetime
import json
import os
import struct
import threading
import time

import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Ellipse                     # 2D head outlines
from matplotlib.widgets import Button                       # clickable buttons
from mpl_toolkits.mplot3d.art3d import Poly3DCollection     # 3D polygons for the head
from bleak import BleakClient, BleakScanner

# =============================================================================
# CONFIGURATION - BLE values must match HeadImpactMonitor.ino exactly
# =============================================================================

BLE_DEVICE_NAME  = "HeadImpactMonitor"
CHAR_UUID_IMU    = "abcd1234-ab12-ab12-ab12-abcdef123456"   # NOTIFY: IMU packets
CHAR_UUID_PLAYER = "abcd1234-ab12-ab12-ab12-abcdef123457"   # READ: headband ID
CHAR_UUID_CMD    = "abcd1234-ab12-ab12-ab12-abcdef123458"   # WRITE: commands

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

# Seconds after the first connection before the automatic zero
AUTO_TARE_DELAY_S = 3.0

# Fallback only, used until "Calibrate axes" has been run: which sensor axis
# points FORWARD (out of the forehead). [0, 0, 1] = board flat on the
# forehead, chip side out. The axis wizard replaces this with measured axes.
SENSOR_FORWARD_AXIS = np.array([0.0, 0.0, 1.0])

# Minimum rotation (degrees) for each wizard gesture to be accepted
MIN_GESTURE_DEG = 10.0

# Default head size (cm): X = width, Y = front-back depth, Z = height
HEAD_WIDTH_CM  = 15.0
HEAD_DEPTH_CM  = 19.0
HEAD_HEIGHT_CM = 23.0

# Default sensor spot before "Place sensor" is used: mid-forehead, given as a
# fraction of the head's half-height above the head's center
DEFAULT_SENSOR_HEIGHT_FRACTION = 0.35

# Axis calibration and sensor placement are kept here between sessions
SETUP_FILE = "headband_setup.json"


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


def sensor_to_head_from_gravity(q_neutral, forward_axis=SENSOR_FORWARD_AXIS):
    """
    Fallback sensor-to-head rotation from one pose (wearer looking ahead):
    up comes from gravity, forward from the assumed mounting axis.

    Returns:
        3x3 matrix H with v_head = H @ v_sensor, or None if the forward axis
        is nearly vertical for this mounting.
    """
    R0 = quaternion_to_rotation_matrix(q_neutral)
    up = R0.T @ np.array([0.0, 0.0, 1.0])          # world up, in sensor axes
    fwd = forward_axis - np.dot(forward_axis, up) * up
    if np.linalg.norm(fwd) < 0.3:
        return None
    fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, up)                       # +X = right (X = Y x Z)
    return np.vstack([right, fwd, up])              # rows = head axes in sensor axes


def rotation_between(q_start, q_end):
    """
    Rotation from one sensor pose to another, measured in the sensor's own
    axes (body frame): R_delta = R_start^T R_end.

    Returns:
        (unit axis in sensor axes, angle in degrees)
    """
    R_delta = quaternion_to_rotation_matrix(q_start).T @ quaternion_to_rotation_matrix(q_end)
    angle = np.arccos(np.clip((np.trace(R_delta) - 1.0) / 2.0, -1.0, 1.0))
    axis = np.array([R_delta[2, 1] - R_delta[1, 2],
                     R_delta[0, 2] - R_delta[2, 0],
                     R_delta[1, 0] - R_delta[0, 1]])
    norm = np.linalg.norm(axis)
    return (axis / norm if norm > 1e-9 else axis), float(np.degrees(angle))


def sensor_to_head_from_gestures(q_still, q_pitch_up, q_yaw_left, q_roll_left):
    """
    Measure how the board is turned on the head from three guided gestures.

    With head axes +X right, +Y forward, +Z up (right-hand rule):
      pitch up  (nose up)        = positive rotation about +X
      yaw left  (turn to left)   = positive rotation about +Z
      roll left (left ear down)  = negative rotation about +Y
    Each gesture's rotation axis, measured in sensor axes, is therefore one
    head axis expressed in sensor axes. The three are combined into the
    nearest exact rotation matrix (SVD), which averages out small errors.

    Returns:
        (H or None, message) with v_head = H @ v_sensor
    """
    gestures = {"pitch up": q_pitch_up, "yaw left": q_yaw_left, "roll left": q_roll_left}
    axes = {}
    for name, q in gestures.items():
        axis, angle = rotation_between(q_still, q)
        if angle < MIN_GESTURE_DEG:
            return None, f"The {name} movement was only {angle:.0f} deg. Move about 30 deg and redo."
        axes[name] = axis

    x_s, z_s, y_s = axes["pitch up"], axes["yaw left"], -axes["roll left"]
    # The three gestures should be roughly perpendicular to each other
    for a, b, label in ((x_s, y_s, "pitch/roll"), (x_s, z_s, "pitch/yaw"), (y_s, z_s, "roll/yaw")):
        if abs(np.dot(a, b)) > 0.5:
            return None, f"The {label} movements were not separate enough. Redo with one clean movement each."

    U, _, Vt = np.linalg.svd(np.vstack([x_s, y_s, z_s]))
    H = U @ Vt
    if np.linalg.det(H) < 0:
        return None, "A movement went the wrong way (e.g. pitch down or roll right). Redo the steps."
    return H, "Axes calibrated from the gestures."


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


def point_on_head(head_cm, view, u, v):
    """
    Convert a click on a 2D placement panel into a point on the ellipsoid
    surface (cm, head axes).
      Front view: u = X (right +), v = Z (up +); the point is on the face side (Y > 0)
      Top view:   u = X (right +), v = Y (forward +); the point is on the top (Z > 0)
    Ellipsoid: (x/rx)^2 + (y/ry)^2 + (z/rz)^2 = 1, solved for the hidden coordinate.

    Returns:
        np.array([x, y, z]) in cm, or None if the click is outside the head outline
    """
    rx, ry, rz = np.asarray(head_cm, dtype=float) / 2.0
    if view == "front":
        inside = 1.0 - (u / rx) ** 2 - (v / rz) ** 2
        return None if inside < 0 else np.array([u, ry * np.sqrt(inside), v])
    inside = 1.0 - (u / rx) ** 2 - (v / ry) ** 2
    return None if inside < 0 else np.array([u, v, rz * np.sqrt(inside)])


# =============================================================================
# SESSION: impact detection, axes, placement, and logging (no BLE or plotting
# in here, so the same logic can be tested with simulated packets)
# =============================================================================
class ImpactSession:
    def __init__(self, player_name, session_id, head_cm, csv_path):
        self.player_name = player_name
        self.session_id  = session_id
        self.head_cm     = np.asarray(head_cm, dtype=float)
        self.csv_path    = csv_path
        self.device_id   = "unknown"     # PLAYER_ID read from the ESP32
        self.lock        = threading.Lock()

        # Sensor position on the head (cm, head axes). Default: mid-forehead.
        rx, ry, rz = self.head_cm / 2.0
        h = DEFAULT_SENSOR_HEIGHT_FRACTION
        self.sensor_cm     = np.array([0.0, ry * np.sqrt(1 - h * h), rz * h])
        self.sensor_placed = False

        # Latest values for the 3D view
        self.latest_q        = np.array([1.0, 0.0, 0.0, 0.0])
        self.latest_accel_g  = 0.0
        self.latest_cal      = (0, 0, 0, 0)
        self.latest_ms       = 0
        self.has_data        = False

        # Axes: H maps sensor axes to head axes (identity until set up)
        self.H              = np.eye(3)
        self.axes_source    = "none"     # "none", "assumed" (gravity), or "wizard"
        self.q_neutral      = None       # pose shown as "looking straight ahead"
        self.tare_requested = False

        # Packet bookkeeping
        self.packets       = 0
        self.dropped       = 0
        self.last_sequence = None
        self.prev_gyro_rad = None
        self.prev_ms       = None

        # Impact detection state
        self.active_event = None
        self.impacts      = []

        # CSV columns: names the dashboard recognizes come first
        self.columns = [
            "sessionId", "playerName", "timestamp", "esp32_timestamp_ms",
            "eventIntensity", "magnitude_ms2", "eventDirection",
            "direction_x", "direction_y", "direction_z", "eventType",
            "head_center_g", "peak_rot_vel_dps", "peak_rot_acc_rads2",
            "duration_ms", "samples", "at_sensor_limit",
            "sensor_x_cm", "sensor_y_cm", "sensor_z_cm",
            "axis_setup", "zeroed", "calibration", "device_id",
        ]
        self.csv_file   = open(csv_path, "w", newline="")
        self.csv_writer = csv.writer(self.csv_file)
        self.csv_writer.writerow(self.columns)
        self.csv_file.flush()

    # --------------------------------------------------------------- geometry
    @property
    def sensor_offset_m(self):
        """Sensor position relative to the head center, in meters (head axes)."""
        return self.sensor_cm / 100.0

    def set_sensor_position(self, point_cm, placed=True):
        with self.lock:
            self.sensor_cm, self.sensor_placed = np.asarray(point_cm, dtype=float), placed

    # ------------------------------------------------------------ setup file
    def save_setup(self, path=SETUP_FILE):
        """Save axis calibration and sensor placement for the next session."""
        rx, ry, rz = self.head_cm / 2.0
        setup = {
            "sensor_to_head": self.H.tolist() if self.axes_source == "wizard" else None,
            # Stored relative to the head size so it still fits a different athlete
            "sensor_on_unit_head": (self.sensor_cm / [rx, ry, rz]).tolist() if self.sensor_placed else None,
            "saved": datetime.datetime.now().isoformat(timespec="seconds"),
        }
        with open(path, "w") as f:
            json.dump(setup, f, indent=2)

    def load_setup(self, path=SETUP_FILE):
        if not os.path.exists(path):
            return
        try:
            with open(path) as f:
                setup = json.load(f)
        except (OSError, ValueError):
            print(f"[SETUP] Could not read {path}; starting without it.")
            return
        if setup.get("sensor_to_head"):
            self.H, self.axes_source = np.array(setup["sensor_to_head"]), "wizard"
            print("[SETUP] Loaded axis calibration from", path)
        if setup.get("sensor_on_unit_head"):
            self.set_sensor_position(np.array(setup["sensor_on_unit_head"]) * self.head_cm / 2.0)
            print("[SETUP] Loaded sensor placement from", path)

    # ------------------------------------------------------------------ axes
    def request_tare(self):
        """Zero on the next packet: the current pose becomes 'looking ahead'."""
        self.tare_requested = True

    def _apply_tare(self, q):
        if self.axes_source != "wizard":
            # No measured axes yet: estimate them from gravity and the assumed mounting
            H = sensor_to_head_from_gravity(q)
            if H is None:
                print("[ZERO] Failed: the assumed forward axis points up or down.")
                print("       Run 'Calibrate axes' instead.")
                return
            self.H, self.axes_source = H, "assumed"
        self.q_neutral = q.copy()
        print("[ZERO] Head zeroed: this pose is now 'looking straight ahead'.")

    def apply_axis_calibration(self, q_still, q_pitch, q_yaw, q_roll):
        H, message = sensor_to_head_from_gestures(q_still, q_pitch, q_yaw, q_roll)
        if H is not None:
            with self.lock:
                self.H, self.axes_source = H, "wizard"
                self.q_neutral = q_still.copy()   # step 1 pose doubles as the zero
        return H is not None, message

    def reset_zero(self):
        """Forget the zero pose (after the ESP32 recalibrates, orientation shifts)."""
        with self.lock:
            self.q_neutral = None

    @property
    def zeroed(self):
        return self.q_neutral is not None

    def display_rotation(self):
        """
        Rotation for the 3D model: the head's rotation relative to the zero
        pose, in head axes. Before zeroing it is the raw sensor orientation.
        """
        with self.lock:
            q, H, q0 = self.latest_q.copy(), self.H.copy(), self.q_neutral
        R = quaternion_to_rotation_matrix(q)
        if q0 is None:
            return R
        R0 = quaternion_to_rotation_matrix(q0)
        # world <- head now = R @ H.T ; world <- head at zero = R0 @ H.T
        return (R0 @ H.T).T @ (R @ H.T)

    # ---------------------------------------------------------------- packets
    def process_packet(self, raw):
        """Unpack one BLE packet and update orientation, zero, and impacts."""
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
            if 1 < gap < 1000:          # a huge jump means the ESP32 restarted
                self.dropped += gap - 1
        self.last_sequence = sequence
        self.packets += 1

        if self.tare_requested:
            self.tare_requested = False
            self._apply_tare(q)

        # Rotate into head axes (identity until the axes are set up)
        H = self.H
        accel = H @ accel_sensor
        omega = np.radians(H @ gyro_sensor_dps)        # rad/s

        # Angular acceleration from the change in angular velocity (rad/s^2)
        alpha = np.zeros(3)
        if self.prev_gyro_rad is not None and self.prev_ms is not None:
            dt = (ms - self.prev_ms) / 1000.0
            if 0 < dt < 0.1:
                alpha = (omega - self.prev_gyro_rad) / dt
        self.prev_gyro_rad, self.prev_ms = omega, ms

        # Acceleration at the head center (rigid body), r = sensor position:
        #   a_sensor = a_center + alpha x r + omega x (omega x r)
        r = self.sensor_offset_m
        accel_center = accel - np.cross(alpha, r) - np.cross(omega, np.cross(omega, r))

        magnitude = float(np.linalg.norm(accel))
        with self.lock:
            self.latest_q, self.latest_accel_g = q, magnitude / G
            self.latest_cal, self.latest_ms, self.has_data = cal, ms, True

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
            "sensor_x_cm": f"{self.sensor_cm[0]:.1f}",
            "sensor_y_cm": f"{self.sensor_cm[1]:.1f}",
            "sensor_z_cm": f"{self.sensor_cm[2]:.1f}",
            "axis_setup": self.axes_source,
            "zeroed": "yes" if self.zeroed else "no",
            "calibration": "S{}G{}A{}M{}".format(*event["cal"]),
            "device_id": self.device_id,
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
                "player_esp32": self.device_id,
                "threshold_g": round(IMPACT_THRESHOLD_MS2 / G, 3),
                "total_events": len(self.impacts),
                "max_g": round(max(peaks), 3) if peaks else 0,
                "mean_g": round(float(np.mean(peaks)), 3) if peaks else 0,
                "head_size_cm": self.head_cm.tolist(),
                "sensor_position_cm": [round(v, 1) for v in self.sensor_cm.tolist()],
                "sensor_placed": self.sensor_placed,
                "axis_setup": self.axes_source,
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
        self.client    = None
        self.loop      = None
        self.thread = threading.Thread(target=lambda: asyncio.run(self._run()), daemon=True)

    def start(self):
        self.thread.start()

    def stop(self):
        self.running = False
        self.thread.join(timeout=5.0)

    def send_command(self, text):
        """Write a text command (e.g. "RECAL") to the ESP32 from any thread."""
        if not (self.connected and self.client and self.loop):
            print(f"[CMD] Not connected - '{text}' was not sent")
            return False
        future = asyncio.run_coroutine_threadsafe(
            self.client.write_gatt_char(CHAR_UUID_CMD, text.encode(), response=True), self.loop)

        def report(done):
            error = done.exception()
            print(f"[CMD] '{text}' failed: {error} (is the new ESP32 sketch uploaded?)"
                  if error else f"[CMD] '{text}' sent to the ESP32")
        future.add_done_callback(report)
        return True

    def _on_notify(self, _sender, data):
        self.session.process_packet(bytes(data))

    async def _run(self):
        self.loop = asyncio.get_running_loop()
        while self.running:
            print(f"[BLE] Scanning for '{BLE_DEVICE_NAME}'...")
            device = await BleakScanner.find_device_by_name(BLE_DEVICE_NAME, timeout=10.0)
            if device is None:
                if self.running:
                    print("[BLE] Not found yet. Is the ESP32 powered on? Retrying...")
                continue

            disconnected = asyncio.Event()
            try:
                # 20 s timeout: the Windows Bluetooth stack can be slow to reconnect
                async with BleakClient(device, timeout=20.0,
                                       disconnected_callback=lambda _c: disconnected.set()) as client:
                    self.client = client
                    print(f"[BLE] Connected to {device.address} (MTU {client.mtu_size})")
                    try:
                        raw_id = await client.read_gatt_char(CHAR_UUID_PLAYER)
                        self.session.device_id = bytes(raw_id).decode(errors="replace").strip()
                        print(f"[BLE] Headband ID: {self.session.device_id}")
                    except Exception:
                        print("[BLE] Headband ID not available (older ESP32 sketch)")
                    await client.start_notify(CHAR_UUID_IMU, self._on_notify)
                    self.connected = True
                    if self.connected_since is None:
                        self.connected_since = time.time()
                        if not self.session.zeroed:
                            print(f"[ZERO] Look straight ahead - zeroing in {AUTO_TARE_DELAY_S:.0f} s")
                    while self.running and not disconnected.is_set():
                        await asyncio.sleep(0.1)
                    if client.is_connected:
                        await client.stop_notify(CHAR_UUID_IMU)
            except Exception as error:   # connection dropped mid-setup, adapter busy, ...
                print(f"[BLE] Connection error: {error}")
            finally:
                self.connected, self.client = False, None
                self.session.finish_impact()   # don't merge hits across a reconnect

            if self.running:
                print("[BLE] Disconnected. Reconnecting...")
                await asyncio.sleep(1.0)


# =============================================================================
# 3D VIEW AND CONTROLS (main thread)
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


# Instructions shown for each step of the axis wizard
WIZARD_STEPS = [
    "STEP 1/4: Look straight ahead and hold still, then click Capture",
    "STEP 2/4: Tilt the head UP (nose up) about 30 deg, hold, click Capture",
    "STEP 3/4: Back to center, then TURN the head LEFT about 30 deg, hold, click Capture",
    "STEP 4/4: Back to center, then TILT the LEFT EAR DOWN about 30 deg, hold, click Capture",
]


def run_view(session, link):
    head_cm = session.head_cm
    points, faces = build_head_mesh(head_cm)
    rx, ry, rz = head_cm / 2.0
    nose       = np.array([0.0, ry * 1.08, -rz * 0.1])
    facing_tip = np.array([0.0, ry * 1.6, 0.0])

    # ---- Layout: 3D head on the left, Front and Top placement panels on the right
    fig = plt.figure(figsize=(14, 8.5))
    fig.patch.set_facecolor("#1a1a2e")
    grid = gridspec.GridSpec(2, 2, figure=fig, width_ratios=[3, 1.4], height_ratios=[1, 1],
                             left=0.03, right=0.97, top=0.9, bottom=0.17, wspace=0.15, hspace=0.35)
    ax = fig.add_subplot(grid[:, 0], projection="3d")
    ax_front = fig.add_subplot(grid[0, 1])
    ax_top = fig.add_subplot(grid[1, 1])

    # ---- 3D axes
    ax.set_facecolor("#1a1a2e")
    limit = float(max(rx, ry, rz)) * 1.7
    ax.set_box_aspect((1, 1, 1))

    def set_camera(elev, azim):
        """Point the camera and restore the default zoom (undoes scroll zoom)."""
        ax.set_xlim(-limit, limit); ax.set_ylim(-limit, limit); ax.set_zlim(-limit, limit)
        ax.view_init(elev=elev, azim=azim)
        fig.canvas.draw_idle()

    set_camera(15, 60)                    # camera in front of and right of the face
    ax.computed_zorder = False            # draw markers on top of the head
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.set_pane_color((0.12, 0.12, 0.2, 1.0))
    ax.set_xlabel("X  right (cm)", color="#cccccc")
    ax.set_ylabel("Y  forward (cm)", color="#cccccc")
    ax.set_zlabel("Z  up (cm)", color="#cccccc")
    ax.tick_params(colors="#888888")
    fig.suptitle("Head Impact Monitor - live orientation", color="white", fontsize=12, y=0.99)

    skin, red = np.array([0.78, 0.66, 0.51]), np.array([1.0, 0.2, 0.2])
    head = Poly3DCollection(points.T[faces], linewidths=0, zorder=1)
    ax.add_collection3d(head)
    nose_dot,  = ax.plot([], [], [], "o", color="#ffffff", markersize=7, zorder=3)
    sensor_mk, = ax.plot([], [], [], "s", color="#33ddff", markersize=8, zorder=3)
    facing_ln, = ax.plot([], [], [], "-", color="#33ddff", linewidth=2, zorder=2)

    # ---- 2D placement panels
    def style_panel(panel, title, width, height, xlabel, ylabel):
        panel.set_facecolor("#14142a")
        panel.set_aspect("equal")
        panel.add_patch(Ellipse((0, 0), width, height, facecolor="#c8a882", alpha=0.35,
                                edgecolor="#e8d0b0", linewidth=1.5))
        pad = max(width, height) * 0.6
        panel.set_xlim(-pad, pad); panel.set_ylim(-pad, pad)
        panel.set_title(title, color="white", fontsize=10)
        panel.set_xlabel(xlabel, color="#999999", fontsize=8)
        panel.set_ylabel(ylabel, color="#999999", fontsize=8)
        panel.tick_params(colors="#777777", labelsize=7)
        for spine in panel.spines.values():
            spine.set_color("#444466")

    style_panel(ax_front, "Front view (facing the athlete)", 2 * rx, 2 * rz, "cm", "up (cm)")
    ax_front.invert_xaxis()   # facing the athlete, their right side is on your left
    ax_front.text(rx * 1.05, -rz * 1.1, "athlete's\nright", color="#aaaaaa", fontsize=7, ha="center")
    ax_front.text(-rx * 1.05, -rz * 1.1, "athlete's\nleft", color="#aaaaaa", fontsize=7, ha="center")
    style_panel(ax_top, "Top view (looking down)", 2 * rx, 2 * ry, "right (cm)", "forward (cm)")
    ax_top.plot([0], [ry * 1.08], "^", color="#ffffff", markersize=7)   # nose
    front_dot, = ax_front.plot([], [], "s", color="#33ddff", markersize=8)
    top_dot,   = ax_top.plot([], [], "s", color="#33ddff", markersize=8)

    # ---- Text overlays
    status = fig.text(0.02, 0.935, "", color="#ffcc44", fontsize=9, family="monospace")
    counter = fig.text(0.98, 0.935, "", color="#ff6666", fontsize=9, ha="right", family="monospace")
    prompt = fig.text(0.5, 0.135, "", color="#ffdd55", fontsize=10, ha="center")

    # ---- UI state shared by the buttons
    ui = {"wizard_step": None, "captures": [], "placing": False,
          "flash_frames": 0, "flash_count": 0, "auto_zero_done": session.zeroed}

    def show_prompt(text):
        prompt.set_text(text)
        fig.canvas.draw_idle()

    def update(_frame):
        # Automatic zero once, a few seconds after the first connection
        if (not ui["auto_zero_done"] and link.connected and link.connected_since
                and time.time() - link.connected_since > AUTO_TARE_DELAY_S
                and ui["wizard_step"] is None):
            ui["auto_zero_done"] = True
            session.request_tare()

        R = session.display_rotation()
        face_vertices = (R @ points).T[faces]

        count = len(session.impacts)
        if count > ui["flash_count"]:
            ui["flash_frames"], ui["flash_count"] = 6, count
        base = red if ui["flash_frames"] > 0 else skin
        ui["flash_frames"] = max(0, ui["flash_frames"] - 1)

        head.set_verts(face_vertices)          # update in place: no new surface each frame
        head.set_facecolor(shade(face_vertices, base))
        with session.lock:
            sensor_cm = session.sensor_cm.copy()
            accel_g, cal = session.latest_accel_g, session.latest_cal
        n, s, f = R @ nose, R @ sensor_cm, R @ facing_tip
        nose_dot.set_data_3d([n[0]], [n[1]], [n[2]])
        sensor_mk.set_data_3d([s[0]], [s[1]], [s[2]])
        facing_ln.set_data_3d([n[0], f[0]], [n[1], f[1]], [n[2], f[2]])
        front_dot.set_data([sensor_cm[0]], [sensor_cm[2]])
        top_dot.set_data([sensor_cm[0]], [sensor_cm[1]])

        if link.connected:
            axes_text = {"wizard": "axes calibrated", "assumed": "axes assumed",
                         "none": "axes not set"}[session.axes_source]
            status.set_text(
                f"{session.device_id} | {accel_g:4.2f} g | cal S{cal[0]} G{cal[1]} A{cal[2]} M{cal[3]} | "
                f"{axes_text} | {'zeroed' if session.zeroed else 'not zeroed'} | "
                f"sensor {'placed' if session.sensor_placed else 'default'} | dropped {session.dropped}")
            status.set_color("#44ff88" if session.zeroed and session.axes_source == "wizard" else "#ffcc44")
        else:
            status.set_text("Searching for the headband...")
            status.set_color("#ffcc44")
        counter.set_text(f"{session.player_name} | Impacts: {count}")
        return head, nose_dot, sensor_mk, facing_ln, front_dot, top_dot

    # ---- Button actions ------------------------------------------------
    def latest_quaternion_or_none():
        """Current raw quaternion, or None if no real data has arrived yet."""
        with session.lock:
            q, has_data = session.latest_q.copy(), session.has_data
        if not link.connected or not has_data or np.allclose(q, [1, 0, 0, 0]):
            return None
        return q

    def start_wizard(_event=None):
        if not link.connected:
            show_prompt("Connect the headband first (waiting for Bluetooth)")
            return
        ui.update(wizard_step=0, captures=[], placing=False)
        show_prompt(WIZARD_STEPS[0])
        print("[AXES] Calibration started. " + WIZARD_STEPS[0])

    def capture(_event=None):
        step = ui["wizard_step"]
        if step is None:
            show_prompt("Click 'Calibrate axes' first")
            return
        q = latest_quaternion_or_none()
        if q is None:   # guard from the earlier version: never capture an empty pose
            show_prompt("No sensor data yet - wait for the headband to connect, then Capture")
            return
        ui["captures"].append(q)
        print(f"[AXES] Step {step + 1} captured")
        if step + 1 < len(WIZARD_STEPS):
            ui["wizard_step"] = step + 1
            show_prompt(WIZARD_STEPS[step + 1])
            return
        ok, message = session.apply_axis_calibration(*ui["captures"])
        ui["wizard_step"] = None
        ui["auto_zero_done"] = True
        print(f"[AXES] {message}")
        if ok:
            session.save_setup()
            show_prompt("Axes calibrated and zeroed. Saved for next time. Look straight ahead.")
        else:
            show_prompt(message + "  Click 'Calibrate axes' to retry.")

    def zero_head(_event=None):
        if not link.connected:
            show_prompt("Not connected yet - zero will run once the headband connects")
        session.request_tare()
        ui["auto_zero_done"] = True
        show_prompt("Zeroed: this pose is now 'looking straight ahead'")

    def start_placement(_event=None):
        ui.update(placing=True, wizard_step=None)
        show_prompt("Click where the sensor sits on the FRONT or TOP view")

    def recal_esp32(_event=None):
        if link.send_command("RECAL"):
            session.reset_zero()
            ui["auto_zero_done"] = True
            show_prompt("ESP32 recalibrating: hold still, 6 orientations, figure-8. Then click Zero head.")
        else:
            show_prompt("Not connected - RECAL not sent")

    def save_and_quit(_event=None):
        plt.close(fig)   # the main program then saves the CSV and summary

    def on_click(event):
        """Place the sensor where the user clicks on a placement panel."""
        if not ui["placing"] or event.inaxes not in (ax_front, ax_top) or event.xdata is None:
            return
        view = "front" if event.inaxes is ax_front else "top"
        point = point_on_head(head_cm, view, event.xdata, event.ydata)
        if point is None:
            show_prompt("That spot is outside the head outline - click inside it")
            return
        session.set_sensor_position(point)
        session.save_setup()
        ui["placing"] = False
        show_prompt(f"Sensor placed at x={point[0]:.1f}, y={point[1]:.1f}, z={point[2]:.1f} cm. Saved.")
        print(f"[PLACE] Sensor at {np.round(point, 1)} cm (head axes)")

    def on_key(event):
        if event.key in ("t", "T"):
            zero_head()

    # ---- Two rows of buttons: setup tools on top, views below
    def add_buttons(specs, y, color):
        width, gap, left = 0.145, 0.012, 0.035
        made = []
        for index, (label, callback) in enumerate(specs):
            button = Button(fig.add_axes([left + index * (width + gap), y, width, 0.05]), label,
                            color=color, hovercolor="#3d3d66")
            button.label.set_color("white")
            button.label.set_fontsize(9)
            button.on_clicked(callback)
            made.append(button)
        return made

    buttons = add_buttons([
        ("Calibrate axes", start_wizard),
        ("Capture",        capture),
        ("Zero head (T)",  zero_head),
        ("Place sensor",   start_placement),
        ("Recal ESP32",    recal_esp32),
        ("Save & quit",    save_and_quit),
    ], 0.07, "#2a2a44")
    buttons += add_buttons([
        ("Reset view", lambda _e: set_camera(15, 60)),
        ("Front view", lambda _e: set_camera(0, 90)),    # camera facing the face
        ("Side view",  lambda _e: set_camera(0, 0)),     # camera at the wearer's right
        ("Top view",   lambda _e: set_camera(90, 90)),   # camera above the head
    ], 0.012, "#22223a")
    fig._buttons = buttons   # keep references, or the buttons stop responding

    fig.canvas.mpl_connect("button_press_event", on_click)
    fig.canvas.mpl_connect("key_press_event", on_key)
    if session.axes_source != "wizard":
        show_prompt("First time with this headband? Click 'Calibrate axes', then 'Place sensor'")

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
    session.load_setup()           # axis calibration and placement from last time
    link = BleLink(session)
    link.start()
    print(f"[LOG] Writing impacts to {csv_path}\n")

    try:
        run_view(session, link)
    except KeyboardInterrupt:
        print("\n[MAIN] Ctrl+C received.")
    finally:
        link.stop()
        session.close()
        print("[MAIN] Session ended. Upload the CSV on the dashboard's Intake page.")
