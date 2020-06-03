/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
async function queryUserInformation(id) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
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
        if(id.length===9){
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('students');
            const result1 = await contract.evaluateTransaction('QueryStudent',id);
           console.log(`Transaction has been evaluated, result is: ${result1.toString()}`); 
            await gateway.disconnect();
             return result1.toString();
        }else{
        const network = await gateway.getNetwork('manager');
        const contract = network.getContract('teacher');
        const result1 = await contract.evaluateTransaction("QueryManager",id);
        console.log(`Transaction has been evaluated, result is: ${result1.toString()}`); 
        await gateway.disconnect();
          return result1.toString();
        }
        
         

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function query() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
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
        const result = await contract.evaluateTransaction('QueryAllGrades');
       //const result = await contract.evaluateTransaction('QueryAllStudents');
	   //const result1=await contract.evaluateTransaction('Login','202160735','123');
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        await gateway.disconnect();
        return result.toString();
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function createStudent(name,id,term,bj,password) {
    console.log("1111")
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'hello','first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('students');
        console.log("1111")
        //await contract.submitTransaction('CreateStudent',id,name,id,term,bj,password);
        await gateway.disconnect();
        return true

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

module.exports={query,queryUserInformation,createStudent};