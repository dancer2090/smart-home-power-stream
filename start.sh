#!/bin/bash 
cd application
npm i
npm run migrate

cd ../

pip install pysolarmanv5 --break-system-packages
pip install paho-mqtt --break-system-packages
pip install schedule --break-system-packages
pip install PyYAML --break-system-packages


pm2 start ./ecosystem.config.yaml
pm2 startup
pm2 save
