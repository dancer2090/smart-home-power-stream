#!/bin/bash

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
scp -r ./smart-home.zip root@192.168.1.129:/root/