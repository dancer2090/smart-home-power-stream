#!/bin/bash

# Script generates a zip file for production. Then upload it to mini computer
ROOT_USER=root
IP=192.168.1.129

# Prepare frontend build
cd frontend
npm i
npm run build
cd ../

# Remove old version
rm -f smart-home.zip

# Create New Version
zip -r ./smart-home.zip ./ \
 -x "application/node_modules/*" \
 -x "docker-compose.yaml" \
 -x "invertor-worker/venv/*" \
 -x ".idea/*" \
 -x ".git/*" \
 -x "venv/*" \
 -x "frontend/*"
scp -r ./smart-home.zip $ROOT_USER@$IP:/root/