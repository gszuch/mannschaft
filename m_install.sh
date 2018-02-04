#!/bin/bash

# configured for aws ec2 ubuntu 16.10 server
# wget https://www.dropbox.com/s/4wn3ut4lii5180w/m_install.sh
# chmod +x m_install.sh
# run with command: ./m_install.sh
# this script completes upon Solr installation, exit the script (ctl-C) and
# run the next script with ./m_install2.sh

# create default user and update server
add user mannschaft
sudo apt-get update
sudo apt-get -y upgrade

# downloads additional files and sets second install file as executable
wget https://www.dropbox.com/s/l0pa9t1fl1w5tp4/nginx_rp
wget https://www.dropbox.com/s/fsopsleapdimv0l/m_install2.sh
chmod +x m_install2.sh

# install and initialize git, nginx, node.js/npm
sudo apt-get install -y git
git init
sudo apt-get install -y nginx
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

# installs java (required for Solr)
sudo apt-get install -y python-software-properties
sudo apt-get install -y python3
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo "oracle-java9-installer shared/accepted-oracle-license-v1-1 select true" | sudo debconf-set-selections
echo "oracle-java9-installer shared/accepted-oracle-license-v1-1 select true" | sudo debconf-set-selections
sudo apt-get install -y oracle-java9-installer

# downloads and installs mannschaft application
sudo git clone https://gszuch@bitbucket.org/gszuch/mannschaft.git
sudo chmod 777 -R mannschaft
cd mannschaft
sudo npm install

# installs npm2 process mananger to keep app running through reboots or crashes
sudo npm install -g -y pm2
pm2 start app.js
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# configures nginx as reverse proxy to work with application
cd ~
ls
sudo mv nginx_rp /etc/nginx/sites-available/default
sleep 5
sudo systemctl restart nginx

# downloads and installs Solr as service so it starts with server startup
cd /tmp
# wget http://supergsego.com/apache/lucene/solr/7.1.0/solr-7.1.0.tgz
wget http://apache.osuosl.org/lucene/solr/7.1.0/solr-7.1.0.tgz
tar xzf solr-7.1.0.tgz solr-7.1.0/bin/install_solr_service.sh --strip-components=2
sudo ./install_solr_service.sh solr-7.1.0.tgz

# script to be run after this script finishes
# start manually if it does not auto start
cd ~
./m_install2.sh
# content of m_install2.sh downloades at beginning of this script:
# # https://www.dropbox.com/s/fsopsleapdimv0l/m_install2.sh
# # run with command: ./m_install2.sh
#
# # creates a default core for application and allows user to see core before continuing#
# sudo su - solr -c "/opt/solr/bin/solr create -c mannschaft"
# sleep 10
# # creates upload folder to prevent permsission issues on first run
# sudo mkdir /home/ubuntu/mannschaft/uploads
# sudo chmod -R 777 /home/ubuntu/mannschaft/uploads
#
# # configure Solr schema
# wget https://www.dropbox.com/s/u7pjtmf9pok9ho8/managed-schema
# sleep 5
# sudo chmod -R 777 /var/solr
# sudo mv managed-schema /var/solr/data/mannschaft/conf/managed-schema
#
# # reboots system to apply all configurations and start application
# sudo systemctl reboot -i
