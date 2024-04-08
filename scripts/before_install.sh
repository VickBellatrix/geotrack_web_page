#!/bin/bash

# Install node.js
#sudo apt-get install python-software-properties -y
#sudo apt-add-repository ppa:chris-lea/node.js -y
#sudo apt-get update
#sudo apt-get install nodejs -y

# Install nodemon
# sudo npm install nodemon -g

# Install forever module 
# https://www.npmjs.com/package/forever
#sudo npm install forever -g

# Clean working folder
# sudo find /home/ubuntu/test -type f -delete

#!/bin/bash

# Eliminar el archivo antes de continuar si ya existe
rm -f /home/ubuntu/geotrack_web_page/scripts/before_install.sh

# Eliminar el archivo after_install.sh si ya existe
rm -f /home/ubuntu/geotrack_web_page/scripts/after_install.sh

rm -f /home/ubuntu/geotrack_web_page/scripts/application_start.sh

# Resto
