#!/bin/bash 
rm smart-home.zip
zip -r ./smart-home.zip ./ \
 -x "application/node_modules/*" \
 -x "docker-compose.yaml" \
 -x "invertor-worker/venv/*" \
 -x ".idea/*" \
 -x ".git/*" \
 -x "venv/*"
scp -r ./smart-home.zip root@192.168.1.129:/root/