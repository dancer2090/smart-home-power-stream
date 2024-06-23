#!/bin/bash
# process_name = $1
# pm2 restart ${process_name}
export NODE_ENV=production
pm2 stop all
pm2 delete all
pm2 unstartup systemd
pm2 save

#!/bin/bash 
cd application
npm i

cd ../invertor-worker
pip install -r requirements.txt --break-system-packages

cd ../

pm2 start ./ecosystem.config.yaml
pm2 startup
pm2 save
