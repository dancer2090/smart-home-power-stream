# Press the green button in the gutter to run the script.
from services.deye.solarman import Inverter
from constants import LOGGER_SN, LOGGER_IP, LOGGER_PORT, REGISTERS_FILENAME_PATH, REGISTERS_FILENAME, MQTT_HOST
from services.mqtt import MQTT
import schedule, time
import datetime
import json


class ScanInverterLogger:
    def __init__(self, ip, sn):
        self.ip = ip
        self.sn = sn
        self.data = None
        self.mqtt = MQTT(host=MQTT_HOST)

    def before_scan(self):
        now = datetime.datetime.now()
        print(now)
        return

    def after_scan(self):
        self.mqtt.publish(
            topic='mqtt/deye_inverter_ivan/tele/STATE',
            payload=json.dumps(self.data, indent=4)
        )
        print('published')

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


def executor():
    scan_inv = ScanInverterLogger(LOGGER_IP, LOGGER_SN)
    schedule.every(3).seconds.do(scan_inv.scan)

    while True:
        schedule.run_pending()
        time.sleep(1)


def main():
    try:
        executor()
    except KeyboardInterrupt as err:
        print('KeyboardInterrupt error')
        print(err)
        executor()
    except Exception as e:
        print('Exception error')
        print(e)
        executor()


if __name__ == '__main__':
    main()
