# NeuroTrack headband device

Code for the forehead headband that feeds the coach dashboard: an ESP32-SOLO-1 reads a BNO055 IMU and streams it over Bluetooth Low Energy to a Python receiver on a laptop. The receiver shows a live 3D head model, detects impacts, and writes a CSV that the dashboard's Intake page can load.

```
BNO055 --I2C--> ESP32-SOLO-1 --BLE (44-byte packets, 100 Hz)--> head_impact_receiver.py --CSV--> dashboard /intake
```

## Folders

- `esp32/HeadImpactMonitor/HeadImpactMonitor.ino` – Arduino sketch for the ESP32. Keep it inside the `HeadImpactMonitor` folder; the Arduino IDE needs the folder and file names to match.
- `receiver/head_impact_receiver.py` – Python BLE receiver, 3D head view, and impact logger.

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

Connect the receiver once `Sys` and `Gyro` are at least 1. Calibration is lost when the board loses power.

## Python receiver

```bash
python -m pip install -r receiver/requirements.txt
python receiver/head_impact_receiver.py
```

Use `python -m pip` with the same Python that runs the script (for Anaconda on Windows, e.g. `C:/Users/<you>/anaconda3/python.exe -m pip install ...`). Laptop Bluetooth must be on; no pairing is needed. The script asks for head dimensions, scans for "HeadImpactMonitor", connects, and opens the 3D view. Closing the window saves `impact_log_<date>.csv`.

## Loading data into the dashboard

Upload the `impact_log_*.csv` on the dashboard's Intake page. It is read as written: samples from one hit are merged, the impact side is taken from the direction vector, and readings at about 4 g are flagged.

## Known limitations

- In fusion (NDOF) mode the BNO055 caps acceleration at ±4 g and outputs at 100 Hz, so real head impacts are clipped. A high-g accelerometer such as the ADXL375 on the same I2C bus would fix this.
- The direction vector is in the sensor's frame. Impact sides in the dashboard are only reliable once the receiver adds a "tare" (zeroing orientation while the wearer looks straight ahead).
- The receiver logs every 10 ms sample above threshold; the dashboard merges them, but the CSV itself still has several rows per hit.
