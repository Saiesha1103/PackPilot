#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ================= WIFI =================
const char* ssid = "OnePlus 11R 5G";
const char* password = "hattjaaa";

// ================= MQTT =================
const char* mqttServer = "10.70.152.250";
const int mqttPort = 1883;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ================= SENSORS =================
#define DHT_PIN 4
#define DHT_TYPE DHT22

#define VIBRATION_PIN 5
#define IR_PIN 6

DHT dht(DHT_PIN, DHT_TYPE);


// ================= WIFI CONNECT =================
void connectWiFi() {

  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}


// ================= MQTT CONNECT =================
void connectMQTT() {

  while (!mqttClient.connected()) {

    Serial.print("Connecting to MQTT...");

    if (mqttClient.connect("PackPilot-ESP32-01")) {

      Serial.println("CONNECTED");

    } else {

      Serial.print("FAILED, state=");
      Serial.println(mqttClient.state());

      delay(2000);
    }
  }
}


// ================= SETUP =================
void setup() {

  Serial.begin(115200);

  // Needed for our ESP32-S3 USB Serial
  delay(5000);

  dht.begin();

  pinMode(VIBRATION_PIN, INPUT);
  pinMode(IR_PIN, INPUT);

  Serial.println();
  Serial.println("==============================");
  Serial.println("     PACKPILOT MQTT NODE");
  Serial.println("==============================");

  connectWiFi();

  mqttClient.setServer(mqttServer, mqttPort);

  connectMQTT();
}


// ================= LOOP =================
void loop() {

  // Reconnect WiFi if needed
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Reconnect MQTT if needed
  if (!mqttClient.connected()) {
    connectMQTT();
  }

  mqttClient.loop();

  // -------- READ SENSORS --------

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  int vibrationState = digitalRead(VIBRATION_PIN);
  int irState = digitalRead(IR_PIN);


  Serial.println();
  Serial.println("------ SENSOR READINGS ------");

  if (isnan(temperature) || isnan(humidity)) {

    Serial.println("DHT22: READ FAILED");

  } else {

    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.println(" C");

    Serial.print("Humidity    : ");
    Serial.print(humidity);
    Serial.println(" %");
  }

  Serial.print("Vibration   : ");
  Serial.println(vibrationState);

  Serial.print("IR Sensor   : ");
  Serial.println(irState);


  // -------- MQTT PUBLISH --------

  if (!isnan(temperature)) {

    char tempBuffer[10];
    dtostrf(temperature, 1, 2, tempBuffer);

    mqttClient.publish(
      "packpilot/machine/1/temperature",
      tempBuffer
    );
  }

  char vibrationBuffer[5];
  sprintf(vibrationBuffer, "%d", vibrationState);

  mqttClient.publish(
    "packpilot/machine/1/vibration",
    vibrationBuffer
  );


  char irBuffer[5];
  sprintf(irBuffer, "%d", irState);

  mqttClient.publish(
    "packpilot/machine/1/ir",
    irBuffer
  );


  Serial.println("MQTT readings published!");
  Serial.println("-----------------------------");

  delay(2000);
}