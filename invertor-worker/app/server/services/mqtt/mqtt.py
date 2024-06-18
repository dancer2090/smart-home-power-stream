import paho.mqtt.client as mqtt
import uuid


class MQTT:
    def __init__(self, host, port=1883, on_message=None):
        self.host = host
        self.port = port
        self.client = mqtt.Client(client_id=f"WebHmi{uuid.uuid4()}")
        if on_message:
            self.client.on_message = on_message
        self._connect()

    def _connect(self):
        self.client.connect(
            host=self.host,
            port=self.port
        )

    def publish(self, topic, payload):
        self.client.publish(topic, payload)

    def stream(self, topic):
        self.client.subscribe(topic)
        self.client.loop_forever()
