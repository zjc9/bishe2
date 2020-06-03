#！/bin/bash
 cd /home/zjc/project/hello/routes
 sudo node enrollAdmin.js
sudo node registerUser.js 
sudo node registerUser2.js
sudo node query.js
sudo rm -rf ../koa/wallet/*
sudo cp ./wallet/* ../koa/wallet/
echo -e "\033[32m 运行完成 \033[0m" 
