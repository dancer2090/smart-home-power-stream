import mqtt from "mqtt";

class MQTT {
  
  constructor(host, port='1883', on_message = null) {
    this.protocol = 'mqtt'
    this.host = host;
    this.port = port;
    this.connectUrl = `${this.protocol}://${this.host}:${this.port}`
    this.client = null
    this.topic = 'mqtt/#'
    
    if (on_message) this.message = on_message;
  }

  init = () => {
    this.client = mqtt.connect(this.connectUrl);

    this.client.on('connect', this.connect);
    this.client.on('reconnect', this.reconnect);
    this.client.on('error', this.error);
    this.client.on('message', this.message);
    this.client.on('close', this.close);
  }
  subscribe = (err, granted) => {
    console.log("Subscribed to " + this.topic);
    if (err) {console.log(err);}
  }
  publish = (topic, message) => {
    this.client.publish(topic, message)
  }
  connect = () => {
    console.log("Connecting MQTT");
    this.client.subscribe(this.topic, this.subscribe);
  }
  reconnect = (err) => {
    console.log("Reconnect MQTT");
    if (err) {console.log(err);}
	  this.client = mqtt.connect(this.connectUrl);
  }
  error = (err) => {
    console.log("Error!");
	  if (err) {console.log(err);}
  }
  message = (topic, message, packet) => {
    console.log('Topic=' +  topic + '  Message=' + message);
  }
  close = () => {
    console.log("Close MQTT");
  }
}

export default MQTT