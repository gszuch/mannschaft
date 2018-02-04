# https://www.dropbox.com/s/fsopsleapdimv0l/m_install2.sh
# run with command: ./m_install2.sh

# creates a default core for application and allows user to see core before continuing#
sudo su - solr -c "/opt/solr/bin/solr create -c mannschaft"
sleep 10
# # creates upload folder to prevent permsission issues on first run
sudo mkdir /home/ubuntu/mannschaft/uploads
sudo chmod -R 777 /home/ubuntu/mannschaft/uploads

# configure Solr schema
wget https://www.dropbox.com/s/u7pjtmf9pok9ho8/managed-schema
sleep 5
sudo chmod -R 777 /var/solr
sudo mv managed-schema /var/solr/data/mannschaft/conf/managed-schema

# reboots system to apply all configurations and start application
sudo systemctl reboot -i
