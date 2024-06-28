# Press the green button in the gutter to run the script.
from services.deye.solarman import Inverter
import paho.mqtt.client as mqtt # mosquitto.py is deprecated
import time
from constants import LOGGER_SN, LOGGER_IP, LOGGER_PORT, REGISTERS_FILENAME_PATH, REGISTERS_FILENAME, MQTT_HOST
import datetime
import json


class ScanInverterLogger:
    def __init__(self, ip, sn):
        self.ip = ip
        self.sn = sn
        self.data = None

    def before_scan(self):
        self.data = None
        now = datetime.datetime.now()
        print(now)
        return

    def after_scan(self):
        return

    def scan(self):
        self.before_scan()

        inv = Inverter(
            path=REGISTERS_FILENAME_PATH,
            host=self.ip,
            port=LOGGER_PORT,
            serial=self.sn,
            mb_slaveid=1,
            lookup_file=REGISTERS_FILENAME
        )

        inv.get_statistics()
        self.data = inv.get_result()

        self.after_scan()


def main():
    mqttc = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id="smart-home")
    try:
        mqttc.connect(host=MQTT_HOST, port=1883, keepalive=60)
        mqttc.loop_start()

        while True:
            scan_inv = ScanInverterLogger(LOGGER_IP, LOGGER_SN)
            scan_inv.scan()

            mqttc.publish(
                topic='mqtt/deye_inverter_ivan/tele/STATE',
                payload=json.dumps(scan_inv.data, indent=4)
            )
            time.sleep(4)  # sleep for 10 seconds before next call
    except KeyboardInterrupt as err:
        print('KeyboardInterrupt error')
        print(err)
        pass      
    except Exception as e:
        print('Exception error')
        print(e)
        mqttc.disconnect()


if __name__ == '__main__':
    main()
