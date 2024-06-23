#!/bin/bash 
export NODE_ENV=production
cd application
npm i

cd ../invertor-worker
pip install -r requirements.txt --break-system-packages

cd ../

pm2 start ./ecosystem.config.yaml
pm2 startup
pm2 save
