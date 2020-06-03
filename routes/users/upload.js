'use strict';
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function upload_homework(id,address) {
    try {
        // j加载网络模块
        const ccpPath = path.resolve(__dirname, '..','..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // 加载wallet
        const walletPath = path.join(process.cwd(),'..','koa', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // 获得用户ID
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // 创建新连接
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('grade');
        const contract = network.getContract('grades');
        await contract.submitTransaction('PostHomework',id,address);
        await gateway.disconnect();
        return true
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function upload_question(id,address) {
    try {
        // j加载网络模块
        const ccpPath = path.resolve(__dirname, '..','..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // 加载wallet
        const walletPath = path.join(process.cwd(),'..','koa', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // 获得用户ID
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // 创建新连接
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('grade');
        const contract = network.getContract('grades');
        await contract.submitTransaction('PostHomework',id,address);
        await gateway.disconnect();
        return true
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
// query();
// queryStudent();
// getGrade()
module.exports={upload_homework,upload_question};