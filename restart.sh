#!/bin/bash
# process_name = $1
# pm2 restart ${process_name}
pm2 stop ./ecosystem.config.yaml

#!/bin/bash 
cd application
npm i
npm run migrate

cd ../

pm2 restart ./ecosystem.config.yaml
pm2 startup
pm2 save
