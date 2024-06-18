import paho.mqtt.client as mqtt
import aiomqtt
import uuid


class MQTT:
    def __init__(self, host, port=1883, on_message=None):
        self.host = host
        self.port = port
        self.on_message = on_message

    async def publish(self, topic, payload):
        async with aiomqtt.Client(hostname=self.host) as client:
            await client.publish(topic, payload)

    async def stream(self, topic):
        async with aiomqtt.Client(hostname=self.host) as client:
            await client.subscribe(topic)
            print('subscribed')
            async for message in client.messages:
                print(message)
                # self.on_message(message)
