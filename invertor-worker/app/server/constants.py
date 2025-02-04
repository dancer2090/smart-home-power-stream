import os
from dotenv import load_dotenv
from pathlib import Path

IS_PRODUCTION = os.getenv('NODE_ENV') == 'productnion'

cwd = os.getcwd()

dotenv_path = Path(f'{cwd}/.env')

if IS_PRODUCTION:
    dotenv_path = Path(f'{cwd}/.env.production')

load_dotenv(dotenv_path=dotenv_path)

LOGGER_SN = int(os.getenv('LOGGER_SN'))
LOGGER_IP = str(os.getenv('LOGGER_IP'))
REGISTERS_FILENAME = 'deye_hybrid.yaml'
REGISTERS_FILENAME_PATH = f'{cwd}/invertor-worker/app/server/services/deye/'
LOGGER_PORT = int(os.getenv('LOGGER_PORT', 8899))

MQTT_HOST = str(os.getenv('MQTT_HOST'))
MQTT_PORT = int(os.getenv('MQTT_PORT'))
