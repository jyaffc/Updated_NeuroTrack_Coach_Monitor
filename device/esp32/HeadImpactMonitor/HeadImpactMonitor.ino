// =============================================================================
// HeadImpactMonitor.ino
// ESP32-SOLO-1 + BNO055 IMU - Head Orientation & Impact Data Streamer
//
// ARDUINO IDE SETUP (do this before uploading):
//   Board:            ESP32-SOLO-1  (NOT "ESP32 Dev Module": that build is
//                     dual-core and the single-core SOLO-1 crashes in a reboot
//                     loop with "app is built with multi-core support")
//   Upload Speed:     921600
//   Flash Frequency:  80MHz
//   Flash Mode:       DIO
//   Flash Size:       4MB (32Mb)
//   Partition Scheme: Default 4MB with spiffs
//   Port:             whichever COM port your ESP32 appears on
//
// REQUIRED LIBRARIES (install via Sketch > Include Library > Manage Libraries):
//   1. Adafruit BNO055          - search "Adafruit BNO055"
//   2. Adafruit Unified Sensor  - search "Adafruit Unified Sensor"
//   3. ESP32 BLE Arduino and Preferences come with the ESP32 board package
//
// WIRING (breadboard):
//   BNO055 VIN  ->  ESP32 3V3       (power - must be 3.3V not 5V)
//   BNO055 GND  ->  ESP32 GND       (ground)
//   BNO055 SDA  ->  ESP32 GPIO 21   (I2C data)
//   BNO055 SCL  ->  ESP32 GPIO 22   (I2C clock)
//   BNO055 ADR  ->  ESP32 GND       (sets I2C address to 0x28)
//   BNO055 INT, RST, PS0, PS1 -> not connected
//
// HOW TO UPLOAD:
//   1. Connect ESP32 to PC via USB (data cable, not charge-only)
//   2. Select the COM port that appears in Tools > Port
//   3. Click Upload. If it does not connect, hold BOOT and release it once
//      "Connecting..." appears in the console
//   4. Press EN (reset) and open Serial Monitor at 115200 baud
//
// CALIBRATION:
//   Serial Monitor shows Sys/Gyro/Accel/Mag calibration, each 0 (none) to 3 (full).
//   - Gyroscope:     hold the headband completely still for ~2 seconds
//   - Accelerometer: hold it in 6 different orientations, a moment each
//   - Magnetometer:  move it slowly in a figure-8
//   Once all four reach 3, the offsets are SAVED to the ESP32's flash and
//   restored on every power-up, so later sessions only need a short figure-8
//   for the magnetometer. To erase the saved calibration, hold the BOOT
//   button for 3 seconds while the sketch is running.
//
// PLAYER ID:
//   Set PLAYER_ID below before flashing each headband. The Python receiver
//   reads it on connect and writes it into every CSV row.
//
// BLE CHARACTERISTICS:
//   CHAR_UUID_IMU    NOTIFY  47-byte IMU packet at 100 Hz (format below)
//   CHAR_UUID_PLAYER READ    PLAYER_ID text
//   CHAR_UUID_CMD    WRITE   Text commands from Python:
//                              "RECAL" -> erase saved calibration and restart
//                                         the BNO055 so it recalibrates
//
// BLE DATA FORMAT (47 bytes per notification, little-endian):
//   bytes  0-15 : qw, qx, qy, qz            (float32 x4) orientation quaternion
//   bytes 16-27 : linAccX, linAccY, linAccZ (float32 x3) m/s^2, gravity removed
//   bytes 28-39 : gyroX, gyroY, gyroZ       (float32 x3) deg/s
//   bytes 40-43 : timestamp                 (uint32)  ms since boot
//   bytes 44-45 : sequence                  (uint16)  counts up by 1 per packet
//   byte  46    : calibration               (uint8)   sys<<6 | gyro<<4 | accel<<2 | mag
//   Python unpacks this with struct.unpack("<10fIHB", data)
//   All vectors are in the sensor's own axes; the Python receiver rotates them
//   into head axes after the "tare" (zeroing) step.
//
// KNOWN LIMIT:
//   In NDOF fusion mode the BNO055 accelerometer is fixed at +/-4 g, so impacts
//   stronger than ~4 g are clipped. A high-g accelerometer (e.g. ADXL375) on
//   the same I2C bus is needed to measure real impact peaks.
// =============================================================================

#include <Wire.h>
#include <Preferences.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// =============================================================================
// CONFIGURATION
// =============================================================================

// BNO055 I2C address: 0x28 with ADR tied to GND (our wiring), 0x29 with ADR high
#define BNO055_I2C_ADDR  0x28

// I2C clock: 400 kHz makes each sensor read about 4x faster than the default
// 100 kHz. If you see "BNO055 not detected" or garbage values, change to 100000.
#define I2C_CLOCK_HZ  400000

// Sampling interval: 10 ms = 100 Hz, the BNO055's maximum fusion output rate
#define SAMPLE_INTERVAL_MS  10

// How often the calibration status is re-read from the BNO055 (ms)
#define CAL_REFRESH_MS  250

// Player / headband identifier, readable by the Python receiver.
// Change it before flashing each headband (e.g. "Headband-02").
#define PLAYER_ID  "Headband-01"

// BLE device name and UUIDs - must match the Python receiver exactly
#define BLE_DEVICE_NAME   "HeadImpactMonitor"
#define SERVICE_UUID      "12345678-1234-1234-1234-123456789abc"
#define CHAR_UUID_IMU     "abcd1234-ab12-ab12-ab12-abcdef123456"
#define CHAR_UUID_PLAYER  "abcd1234-ab12-ab12-ab12-abcdef123457"
#define CHAR_UUID_CMD     "abcd1234-ab12-ab12-ab12-abcdef123458"

// Requested BLE packet size limit (MTU). The default allows only 20 bytes per
// notification; 185 leaves room for the 47-byte packet on any PC.
#define BLE_MTU  185

// Serial Monitor alert threshold in m/s^2 (debug only; Python does the real
// impact detection). 14.7 m/s^2 = 1.5 g of net acceleration.
#define IMPACT_ACCEL_THRESHOLD_MS2  14.7f

// BOOT button (GPIO 0): hold for this long while running to erase saved calibration
#define BOOT_BUTTON_PIN      0
#define CAL_ERASE_HOLD_MS    3000

// Preferences (flash storage) namespace and key for the calibration offsets
#define PREFS_NAMESPACE  "bno055"
#define PREFS_KEY        "offsets"


// =============================================================================
// IMU DATA PACKET STRUCTURE
// #pragma pack(push, 1) removes padding so the byte layout matches the
// Python format string "<10fIHB" exactly (47 bytes).
// =============================================================================
#pragma pack(push, 1)
struct IMUPacket {
    float    qw, qx, qy, qz;          // Quaternion (sensor orientation)
    float    linAccX, linAccY, linAccZ; // Linear acceleration in m/s^2 (gravity removed)
    float    gyroX, gyroY, gyroZ;     // Angular velocity in deg/s
    uint32_t timestamp;               // ms since power-on
    uint16_t sequence;                // Packet counter, lets Python detect dropped packets
    uint8_t  calibration;             // Packed calibration levels (see header)
};
#pragma pack(pop)

// Compile-time check that the packet is exactly 47 bytes
static_assert(sizeof(IMUPacket) == 47, "IMUPacket must be 47 bytes");


// =============================================================================
// GLOBAL OBJECTS AND STATE
// =============================================================================

Adafruit_BNO055 bno = Adafruit_BNO055(55, BNO055_I2C_ADDR);
Preferences     prefs;

BLEServer*         pServer            = nullptr;
BLECharacteristic* pIMUCharacteristic = nullptr;

bool deviceConnected    = false;   // true while the Python client is connected
bool oldDeviceConnected = false;   // previous state, used to detect changes

// Latest calibration levels (0-3 each)
uint8_t calSys = 0, calGyro = 0, calAccel = 0, calMag = 0;

bool     calibrationSavedThisBoot = false; // save offsets at most once per power-up
uint16_t packetSequence           = 0;     // increments with every BLE packet

// Set by the BLE command callback, handled in loop(). Sensor (I2C) work is
// kept out of the BLE callback because that runs inside the Bluetooth task.
volatile bool recalRequested = false;


// =============================================================================
// BLE SERVER CALLBACKS
// Called by the ESP32 BLE stack when the Python client connects or disconnects
// =============================================================================
class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* server) override {
        deviceConnected = true;
        Serial.println("[BLE] Client connected - streaming started");
    }

    void onDisconnect(BLEServer* server) override {
        deviceConnected = false;
        Serial.println("[BLE] Client disconnected - restarting advertising");
    }
};

// Receives text commands written by the Python receiver
class CommandCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* characteristic) override {
        // getValue() returns std::string on ESP32 core 2.x and String on 3.x;
        // c_str() works for both
        String command = String(characteristic->getValue().c_str());
        command.trim();
        command.toUpperCase();
        if (command == "RECAL") {
            recalRequested = true;   // handled in loop()
        } else {
            Serial.print("[CMD] Unknown command: ");
            Serial.println(command);
        }
    }
};


// =============================================================================
// CALIBRATION STORAGE
// =============================================================================

// Loads saved offsets from flash into the BNO055, if any were saved before.
// Must run after bno.begin(); the library switches to config mode internally.
void restoreCalibration() {
    prefs.begin(PREFS_NAMESPACE, true);  // true = read-only
    if (prefs.getBytesLength(PREFS_KEY) == sizeof(adafruit_bno055_offsets_t)) {
        adafruit_bno055_offsets_t offsets;
        prefs.getBytes(PREFS_KEY, &offsets, sizeof(offsets));
        bno.setSensorOffsets(offsets);
        Serial.println("[CAL] Saved calibration restored from flash");
        Serial.println("      Move the headband in a short figure-8 to settle the magnetometer");
    } else {
        Serial.println("[CAL] No saved calibration yet - do the full calibration routine");
    }
    prefs.end();
}

// Saves the current offsets to flash. getSensorOffsets() only succeeds when
// the sensor reports full calibration, so partial offsets are never stored.
void saveCalibration() {
    adafruit_bno055_offsets_t offsets;
    if (bno.getSensorOffsets(offsets)) {
        prefs.begin(PREFS_NAMESPACE, false);  // false = read/write
        prefs.putBytes(PREFS_KEY, &offsets, sizeof(offsets));
        prefs.end();
        calibrationSavedThisBoot = true;
        Serial.println("[CAL] Full calibration saved to flash");
    }
}

// Erases the saved offsets (triggered by holding the BOOT button)
void eraseCalibration() {
    prefs.begin(PREFS_NAMESPACE, false);
    prefs.remove(PREFS_KEY);
    prefs.end();
    calibrationSavedThisBoot = false;
    Serial.println("[CAL] Saved calibration erased - recalibrate from scratch");
}

// Starts (or restarts) the BNO055 in NDOF fusion mode.
// restoreSaved = true loads the calibration saved in flash.
bool startSensor(bool restoreSaved) {
    Serial.print("[IMU] Starting BNO055 at I2C address 0x");
    Serial.println(BNO055_I2C_ADDR, HEX);

    if (!bno.begin()) {   // begin() also starts the I2C bus and resets fusion
        Serial.println("[ERROR] BNO055 not detected. Check wiring:");
        Serial.println("        VIN -> 3V3, GND -> GND");
        Serial.println("        SDA -> GPIO 21, SCL -> GPIO 22");
        Serial.println("        ADR -> GND (for address 0x28)");
        return false;
    }
    Wire.setClock(I2C_CLOCK_HZ);  // Faster reads once the sensor is found
    Serial.println("[IMU] BNO055 running (NDOF fusion mode, 100 Hz)");

    // Restore saved calibration before switching on the external crystal
    if (restoreSaved) {
        restoreCalibration();
    }
    bno.setExtCrystalUse(true);  // More accurate timing for the fusion algorithm
    return true;
}

// Handles the "RECAL" command: forget saved calibration and restart the sensor
// so all calibration levels start again from 0
void recalibrateSensor() {
    Serial.println("[CMD] RECAL received - restarting the BNO055");
    eraseCalibration();
    if (!startSensor(false)) {
        Serial.println("[ERROR] BNO055 did not restart - check wiring, then press EN");
    }
    calSys = calGyro = calAccel = calMag = 0;
    Serial.println("[CAL] Do the calibration routine again (still, 6 orientations, figure-8)");
}

// Reads the four calibration levels from the BNO055
void refreshCalibration() {
    bno.getCalibration(&calSys, &calGyro, &calAccel, &calMag);
}

// Packs the four 0-3 levels into one byte: sys<<6 | gyro<<4 | accel<<2 | mag
uint8_t packedCalibration() {
    return (uint8_t)(((calSys & 0x3) << 6) | ((calGyro & 0x3) << 4) |
                     ((calAccel & 0x3) << 2) | (calMag & 0x3));
}


// =============================================================================
// SETUP - Runs once on power-on or after pressing EN
// =============================================================================
void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println();
    Serial.println("==============================================");
    Serial.println("  HeadImpactMonitor - ESP32-SOLO-1 + BNO055");
    Serial.println("==============================================");

    pinMode(BOOT_BUTTON_PIN, INPUT_PULLUP);  // BOOT button reads LOW when pressed

    // --- BNO055 over I2C (GPIO 21 = SDA, GPIO 22 = SCL) ---
    if (!startSensor(true)) {
        Serial.println("  Halting. Fix wiring and press EN to retry.");
        while (true) {
            delay(1000);
        }
    }

    // --- BLE ---
    BLEDevice::init(BLE_DEVICE_NAME);
    BLEDevice::setMTU(BLE_MTU);  // Allow packets larger than the 20-byte default

    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService* pService = pServer->createService(SERVICE_UUID);

    // NOTIFY: the ESP32 pushes each packet without the PC having to ask
    pIMUCharacteristic = pService->createCharacteristic(
        CHAR_UUID_IMU,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pIMUCharacteristic->addDescriptor(new BLE2902());  // Lets the client subscribe

    // READ: headband identifier for the Python receiver
    BLECharacteristic* pPlayerCharacteristic = pService->createCharacteristic(
        CHAR_UUID_PLAYER,
        BLECharacteristic::PROPERTY_READ
    );
    pPlayerCharacteristic->setValue((uint8_t*)PLAYER_ID, strlen(PLAYER_ID));

    // WRITE: text commands from the Python receiver (e.g. "RECAL")
    BLECharacteristic* pCommandCharacteristic = pService->createCharacteristic(
        CHAR_UUID_CMD,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCommandCharacteristic->setCallbacks(new CommandCallbacks());

    pService->start();

    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();

    Serial.print("[BLE] Advertising as ");
    Serial.print(BLE_DEVICE_NAME);
    Serial.print("  (player ID: ");
    Serial.print(PLAYER_ID);
    Serial.println(")");
    Serial.println();
    Serial.println("----------------------------------------------");
    Serial.println("  CALIBRATION");
    Serial.println("  Gyro:  hold completely still for 2 seconds");
    Serial.println("  Accel: hold in 6 different orientations");
    Serial.println("  Mag:   move in a slow figure-8");
    Serial.println("  Full calibration (3/3/3/3) is saved automatically");
    Serial.println("  Hold BOOT for 3 s to erase saved calibration");
    Serial.println("----------------------------------------------");
    Serial.println();
}


// =============================================================================
// LOOP
// =============================================================================
void loop() {
    static uint32_t lastSampleTime   = 0;
    static uint32_t lastCalRefresh   = 0;
    static uint32_t lastCalPrintTime = 0;
    static uint32_t bootPressedSince = 0;

    uint32_t now = millis();

    // --- BLE reconnection: restart advertising after the client leaves ---
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);  // Give the BLE stack time to clean up
        pServer->startAdvertising();
        oldDeviceConnected = false;
        Serial.println("[BLE] Advertising restarted - waiting for reconnection");
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = true;
        packetSequence = 0;  // Restart the counter for each connection
    }

    // --- "RECAL" command from the Python receiver ---
    if (recalRequested) {
        recalRequested = false;
        recalibrateSensor();
        calibrationSavedThisBoot = false;   // allow saving the new calibration
    }

    // --- BOOT button held for 3 s: erase saved calibration ---
    if (digitalRead(BOOT_BUTTON_PIN) == LOW) {
        if (bootPressedSince == 0) {
            bootPressedSince = now;
        } else if (now - bootPressedSince >= CAL_ERASE_HOLD_MS) {
            eraseCalibration();
            bootPressedSince = 0;
            while (digitalRead(BOOT_BUTTON_PIN) == LOW) {
                delay(10);  // Wait for release so it erases only once
            }
        }
    } else {
        bootPressedSince = 0;
    }

    // --- Calibration: refresh levels and save once fully calibrated ---
    if (now - lastCalRefresh >= CAL_REFRESH_MS) {
        lastCalRefresh = now;
        refreshCalibration();
        if (!calibrationSavedThisBoot && calSys == 3 && calGyro == 3 &&
            calAccel == 3 && calMag == 3) {
            saveCalibration();
        }
    }

    // Print calibration every 2 s while waiting for the Python client
    if (!deviceConnected && (now - lastCalPrintTime >= 2000)) {
        lastCalPrintTime = now;
        Serial.printf("[CAL] Sys:%u  Gyro:%u  Accel:%u  Mag:%u", calSys, calGyro, calAccel, calMag);
        Serial.println((calSys >= 1 && calGyro >= 1)
                           ? "   Ready - run the Python receiver"
                           : "   Still calibrating...");
    }

    // --- Sampling and streaming at 100 Hz while connected ---
    if (deviceConnected && (now - lastSampleTime >= SAMPLE_INTERVAL_MS)) {
        lastSampleTime = now;

        // Orientation from the BNO055's on-chip sensor fusion
        imu::Quaternion quat = bno.getQuat();
        // Acceleration with gravity removed (m/s^2), in sensor axes
        imu::Vector<3> linAccel = bno.getVector(Adafruit_BNO055::VECTOR_LINEARACCEL);
        // Angular velocity (deg/s), in sensor axes
        imu::Vector<3> gyro = bno.getVector(Adafruit_BNO055::VECTOR_GYROSCOPE);

        IMUPacket packet;
        packet.qw          = (float)quat.w();
        packet.qx          = (float)quat.x();
        packet.qy          = (float)quat.y();
        packet.qz          = (float)quat.z();
        packet.linAccX     = (float)linAccel.x();
        packet.linAccY     = (float)linAccel.y();
        packet.linAccZ     = (float)linAccel.z();
        packet.gyroX       = (float)gyro.x();
        packet.gyroY       = (float)gyro.y();
        packet.gyroZ       = (float)gyro.z();
        packet.timestamp   = now;
        packet.sequence    = packetSequence++;
        packet.calibration = packedCalibration();

        pIMUCharacteristic->setValue((uint8_t*)&packet, sizeof(IMUPacket));
        pIMUCharacteristic->notify();

        // Serial alert for strong accelerations (debug only)
        float accelMagnitude = sqrtf(packet.linAccX * packet.linAccX +
                                     packet.linAccY * packet.linAccY +
                                     packet.linAccZ * packet.linAccZ);
        if (accelMagnitude > IMPACT_ACCEL_THRESHOLD_MS2) {
            Serial.printf("[ALERT] %.2f m/s^2 (%.2f g) at t=%lu ms\n",
                          accelMagnitude, accelMagnitude / 9.81f, (unsigned long)now);
        }
    }
}
