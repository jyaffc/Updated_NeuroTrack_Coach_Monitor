# NeuroTrack headband device

Code for the forehead headband that feeds the coach dashboard: an ESP32-SOLO-1 reads a BNO055 IMU and streams it over Bluetooth Low Energy to a Python receiver on a laptop. The receiver shows a live 3D head model, detects impacts, and writes a CSV that the dashboard's Intake page can load.

```
BNO055 --I2C--> ESP32-SOLO-1 --BLE (47-byte packets, 100 Hz)--> head_impact_receiver.py --CSV--> dashboard /intake
```

## Folders

- `esp32/HeadImpactMonitor/HeadImpactMonitor.ino` – Arduino sketch for the ESP32. Keep it inside the `HeadImpactMonitor` folder; the Arduino IDE needs the folder and file names to match.
- `receiver/head_impact_receiver.py` – Python BLE receiver, 3D head view, and impact logger.

The sketch and the receiver must be from the same version: the receiver expects 47-byte packets (`<10fIHB`: quaternion, linear acceleration, gyro, timestamp, sequence number, calibration byte) and warns if the size is wrong.

## Wiring (breadboard)

| BNO055 | ESP32-SOLO-1 | Purpose |
|---|---|---|
| VIN | 3V3 | Power (3.3 V, not 5 V) |
| GND | GND | Ground |
| SDA | GPIO 21 | I2C data |
| SCL | GPIO 22 | I2C clock |
| ADR | GND | Sets I2C address to 0x28 |

INT, RST, PS0, and PS1 stay unconnected.

## ESP32 setup (Arduino IDE)

1. Install the board package: Tools > Board > Boards Manager > "esp32 by Espressif Systems".
2. Install libraries: "Adafruit BNO055" and "Adafruit Unified Sensor". The BLE library comes with the board package.
3. Select **Tools > Board > esp32 > ESP32-SOLO-1**. Do not use "ESP32 Dev Module": the SOLO-1 is single-core and crashes in a reboot loop with that setting.
4. Settings: Upload Speed 921600, Flash Frequency 80MHz, Flash Mode DIO, Flash Size 4MB, Partition Scheme "Default 4MB with spiffs". For the first upload after a crash loop, enable "Erase All Flash Before Sketch Upload".
5. Upload (hold BOOT if it does not connect, release when "Connecting..." appears), press EN, and open the Serial Monitor at 115200 baud.

## Calibration

The Serial Monitor prints `Sys/Gyro/Accel/Mag` calibration levels (0 to 3) every 2 seconds until the receiver connects.

- Gyro: hold the headband still for about 2 seconds.
- Accel: hold it in 6 different orientations, a moment each.
- Mag: move it slowly in a figure-8.

Connect the receiver once `Sys` and `Gyro` are at least 1.

When all four reach 3, the offsets are saved to the ESP32's flash and restored on every power-up, so later sessions only need a short figure-8 for the magnetometer. To erase the saved calibration, hold the **BOOT** button for 3 seconds while the sketch is running.

If the upload fails with "Could not open COM3": replug the board and pick the port that appears in Tools > Port, use a data USB cable (not charge-only), install the CP210x or CH340 driver if Device Manager shows an unknown device, and close any other program using the port.

## Python receiver

```bash
python -m pip install -r receiver/requirements.txt
python receiver/head_impact_receiver.py
```

Use `python -m pip` with the same Python that runs the script (for Anaconda on Windows, e.g. `C:/Users/<you>/anaconda3/python.exe -m pip install ...`). Laptop Bluetooth must be on; no pairing is needed.

1. The script asks for the athlete name, a session name, and head size (width, depth, height in cm).
2. It scans for "HeadImpactMonitor" and connects, reconnecting on its own if the link drops.
3. **Tare:** 3 seconds after connecting, it zeroes the model while the wearer looks straight ahead. Press **T** in the 3D window to re-zero. After the tare, all vectors use head axes: +X right, +Y forward, +Z up.
4. The 3D view shows the head with a nose marker, the forehead sensor, and a facing arrow, plus connection, calibration, and dropped-packet status.
5. Close the window (or Ctrl+C) to end the session.

If nodding "yes" shows on the model as a sideways tilt, the board is mounted differently than assumed: change `SENSOR_FORWARD_AXIS` at the top of the script (default `[0, 0, 1]`, board flat on the forehead with the chip facing out).

### What the receiver records

Each impact is one CSV row, written the moment the hit ends (acceleration back under 1.5 g for 100 ms), so nothing is lost if the script crashes. Files are `impact_log_<date>_<time>.csv` plus a `.json` session summary.

| Column | Meaning |
|---|---|
| `sessionId`, `playerName`, `timestamp` | Session, athlete, and wall-clock time of the peak |
| `eventIntensity`, `magnitude_ms2` | Peak linear acceleration at the sensor, in g and m/s² |
| `eventDirection`, `direction_x/y/z` | Side the hit came from, and the unit acceleration vector in head axes |
| `head_center_g` | Estimated peak acceleration at the head center: a_c = a_s − α×r − ω×(ω×r), using the head size and sensor position. α comes from differentiating the gyro at 100 Hz, so it is noisy; treat it as an estimate |
| `peak_rot_vel_dps`, `peak_rot_acc_rads2` | Peak rotational velocity (deg/s) and acceleration (rad/s²) |
| `duration_ms`, `samples` | How long the hit lasted and how many samples it spans |
| `at_sensor_limit` | `yes` when the peak reached the BNO055's 4 g ceiling |
| `tared`, `calibration` | Whether head axes were set, and calibration levels at the time |

## Loading data into the dashboard

Upload the `impact_log_*.csv` on the dashboard's Intake page. It is read as written, with the athlete name, session, and impact side already filled in. Older CSVs from the first receiver version also load: the dashboard merges their repeated samples and works out the side from the direction vector.

## Known limitations

- In fusion (NDOF) mode the BNO055 caps acceleration at ±4 g and outputs at 100 Hz, so real head impacts are clipped. A high-g accelerometer such as the ADXL375 on the same I2C bus would fix this.
- Impact sides depend on the tare and on `SENSOR_FORWARD_AXIS` matching how the board is worn.
- The head center is approximated by the center of the ellipsoid model, and the sensor position by a point on the forehead (`SENSOR_HEIGHT_FRACTION`).
- Impacts only reach the PC while the receiver is connected; the ESP32 does not store hits on its own.
