'use strict';
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function postGrade(obj) {
    console.log("changdu"+obj.length)
    
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..','..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(),'..','koa', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('grade');

        // Get the contract from the network.
        const contract = network.getContract('grades');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        for(var i=0;i<obj.length;i++){
            
            var {stu_name,num,bj,term,teacher,course,kt1,kt2,kt3,dm1,dm2,dm3,sy1,sy2,sy3,ps_grade,qm_grade,totalgrade,sta}=obj[i]
            var gradeID=num.toString()+teacher.toString()+term.toString()
            console.log(gradeID)
            await contract.submitTransaction('postGrade',gradeID,stu_name,num,bj,term,teacher,course,kt1,kt2,kt3,dm1,dm2,dm3,sy1,sy2,sy3,ps_grade,qm_grade,totalgrade,sta);
        }
       
       //const result = await contract.evaluateTransaction('QueryAllStudents');
	   //const result1=await contract.evaluateTransaction('Login','202160735','123');
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        await gateway.disconnect();
        return true;
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);


    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
// query();
// queryStudent();
// getGrade()
module.exports={postGrade};