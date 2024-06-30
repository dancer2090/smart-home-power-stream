import MQTT from './lib/mqtt-sh.mjs';

const on_message = (topic, message, packet) => {
  console.log(topic, message)
}
const mqtt = new MQTT('192.168.1.129', 1883, on_message)
mqtt.init()
