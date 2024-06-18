#!/bin/bash 

apt update
apt install -y iproute2
apt install -y network-manager
apt install nmap -y
apt install netplan.io -y

cat > /etc/netplan/network.yaml <<- "EOF"
network:
  version: 2
  ethernets:
    end0:
      dhcp4: false
      addresses: [192.168.1.129/24]
      gateway4: 192.168.1.254
      nameservers:
        addresses: [192.168.1.254]
EOF


chmod 600 /etc/netplan/network.yaml

apt install openvswitch-switch -y
netplan apply

systemctl start systemd-networkd
systemctl enable systemd-networkd
systemctl status systemd-networkd

systemctl start systemd-resolved
systemctl enable systemd-resolved
systemctl status systemd-resolved

apt install software-properties-common -y
apt install curl -y
apt install git -y

# SSH
apt update
apt install openssh-server
systemctl status ssh
service ssh start

apt install sudo -y

# PM2, Node
apt install curl -y
apt install git -y
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install pm2 -g
sudo pm2 status

pm2 install pm2-logrotate

apt install unzip -y

apt install python3.11 -y
apt install python3-pip -y
apt install cmake -y
apt install python3.11-venv -y
