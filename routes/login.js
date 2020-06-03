'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
async function Login(username,password) {
    try {
        // 载入网络配置
        console.log(`username的长度为${username.length}`)
        const ccpPath = path.resolve(__dirname, '..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

  
        const identity = await wallet.get('user2');
        if (!identity) {
            console.log('An identity for the user "user2" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }


        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user2', discovery: { enabled: true, asLocalhost: true } });
        var network =''
        var contract=''
        var tokenName=''
        if(username.length==9){
         network = await gateway.getNetwork('mychannel');
         contract = network.getContract('students'); 
         tokenName='student'
         console.log('学生登录')
        }else if(username.length==3){
            network = await gateway.getNetwork('manager');
            contract = network.getContract('teacher'); 
            console.log('管理员登录登录')
            tokenName='manager'
        }else if(username.length==4){
            network = await gateway.getNetwork('manager');
            contract = network.getContract('teacher'); 
            console.log('教师登录登录')
            tokenName='teacher'
        }else{
            return {"code":10000,"data":"error"}
        }
 

	   const result=await contract.evaluateTransaction('Login',username,password);

        await gateway.disconnect()
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        if(result=='true'){
            console.log(`结果事${result}`)
             return {"code":20000,"data":{"token":`${tokenName}-token`}}
    
        }else{
             console.log(`结果事${result}`)
        }
        return result;



    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
// Login(username,password);
module.exports=Login;