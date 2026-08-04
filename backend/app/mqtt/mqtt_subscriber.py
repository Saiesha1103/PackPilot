import paho.mqtt.client as mqtt
from app.database.database import SessionLocal
from app.models.machine import Machine
from app.models.sensor import SensorReading

MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883

TOPIC_SENSOR_MAP = {
    "packpilot/machine/1/temperature": 1,
    "packpilot/machine/1/vibration": 2,
    "packpilot/machine/1/ir": 3,
}


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("MQTT subscriber connected to Mosquitto")

        client.subscribe("packpilot/machine/1/#")

        print("Subscribed to packpilot/machine/1/#")
    else:
        print(f"MQTT connection failed: {reason_code}")


def on_message(client, userdata, msg):
    topic = msg.topic

    try:
        value = float(msg.payload.decode())
    except (ValueError, UnicodeDecodeError):
        print(f"Invalid MQTT payload on {topic}")
        return

    sensor_id = TOPIC_SENSOR_MAP.get(topic)

    if sensor_id is None:
        print(f"Unknown MQTT topic: {topic}")
        return

    db = SessionLocal()

    try:
        reading = SensorReading(
            sensor_id=sensor_id,
            value=value
        )

        db.add(reading)
        db.commit()
        db.refresh(reading)

        print(
            f"Saved → Sensor {sensor_id} | "
            f"Value {value} | Reading ID {reading.id}"
        )

    except Exception as exc:
        db.rollback()
        print(f"Database error: {exc}")

    finally:
        db.close()


def start_mqtt_subscriber():
    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id="PackPilot-Backend"
    )

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    print("Starting PackPilot MQTT subscriber...")

    # Run MQTT network loop in background thread
    client.loop_start()

    return client