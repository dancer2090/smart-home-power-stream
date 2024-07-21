#!/bin/bash 

apt update

# SSH

# PM2, Node
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install pm2 -g
sudo pm2 status

pm2 install pm2-logrotate

apt install unzip -y

sudo add-apt-repository ppa:deadsnakes/ppa
apt install python3.11 -y
apt install python3-pip -y
apt install cmake -y

apt install postgresql -y
apt install postgresql-contrib -y

apt install mosquitto -y
apt install mosquitto-clients -y

cat > /etc/mosquitto/conf.d/default.conf <<- "EOF"
allow_anonymous true
listener 1883

EOF

systemctl restart mosquitto

sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE smart_home;"
sudo su postgres <<EOF
psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
psql -c "CREATE DATABASE smart_home;"
EOF

# Open Postgres Port 0.0.0.0 manually - http://bookstack.frontback.org/books/smart-home/page/orange-pi-install
echo "listen_addresses = '*'" >> /etc/postgresql/15/main/postgresql.conf
echo "host    all             all             0.0.0.0/0            md5" >> /etc/postgresql/15/main/pg_hba.conf

reboot

# Disable power suply
# cd /etc/systemd/sleep.conf 
