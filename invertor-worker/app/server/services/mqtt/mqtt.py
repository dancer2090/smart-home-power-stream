import paho.mqtt.client as mqtt
import uuid


def on_connect(client, userdata, flags, reason_code, properties):
    print(reason_code)


def on_disconnect(client, userdata, rc):
    client.reconnect()


class MQTT:
    def __init__(self, host, port=1883, on_message=None):
        self.host = host
        self.port = port
        self.client = mqtt.Client(client_id=f"WebHmi{uuid.uuid4()}", reconnect_on_failure=True)
        self.client.on_connect = on_connect
        self.client.on_disconnect = on_disconnect
        if on_message:
            self.client.on_message = on_message

    def connect(self):
        self.client.connect(
            host=self.host,
            port=self.port
        )

    def reconnect(self):
        self.client.reconnect()

    def disconnect(self):
        self.client.disconnect()

    def publish(self, topic, payload):
        self.connect()
        self.client.publish(topic, payload)
        self.disconnect()
