#!/bin/bash 
zip -r ./smart-home.zip ./ -x "application/node_modules/*" -x "docker-compose.yaml" -x "invertor-worker/venv/*" -x ".idea/*"
scp -r ./smart-home.zip root@192.168.1.129:/root/