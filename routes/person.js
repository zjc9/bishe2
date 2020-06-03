var express = require('express');
var router = express.Router();
var fs = require("fs");

router.get('/', function (req, res, next) {
 

            res.render('persons', {title: '汽车系统', datas: []});
        
   
});

router.get('/add', function (req, res) {
  res.render('add');
});

router.post('/add1', function (req, res) {
     
    var car = req.body.car;
    var colour = req.body.colour;
    var make = req.body.make;
    var model = req.body.model;
    var owner = req.body.owner;
//fs.writeFile('input.txt', "return: ", tx_id._transaction_id);

 
'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode Invoke
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

//
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('user1', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user1 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}

	// get a transaction id object based on the current user assigned to fabric client
	tx_id = fabric_client.newTransactionID();
	console.log("Assigning transaction_id: ", tx_id._transaction_id);
fs.writeFile('input.txt',  '\n' +tx_id._transaction_id + '\n' ,  function(err) {
   if (err) {
       return console.error(err);
   }});

	// createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
	// changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Dave'],
	// must send the proposal to endorsing peers
	var request = {
		//targets: let default to the peer assigned to the client
		chaincodeId: 'fabcar',
		fcn: 'createCar',
		args: [ car, colour, make, model, owner],
		chainId: 'mychannel',
		txId: tx_id
	};

	// send the transaction proposal to the peers
fs.open('input.txt', 'w','\n'+"send the transaction proposal to the peers" + '\n' ,  function(err) {
   if (err) {
       return console.error(err);
   }});
	return channel.sendTransactionProposal(request);
}).then((results) => {
	var proposalResponses = results[0];
	var proposal = results[1];
	let isProposalGood = false;
	if (proposalResponses && proposalResponses[0].response &&
		proposalResponses[0].response.status === 200) {
			isProposalGood = true;
			console.log('Transaction proposal was good');
//fs.open('input.txt', 'w','\n'+'Transaction proposal was good' + '\n' ,  function(err) {
  // if (err) {
    //   return console.error(err);
  // }

//});
	} else {
			console.error('Transaction proposal was bad');
               
		}
	if (isProposalGood) {
		console.log(util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status, proposalResponses[0].response.message));

		// build up the request for the orderer to have the transaction committed
		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

		// set the transaction listener and set a timeout of 30 sec
		// if the transaction did not get committed within the timeout period,
		// report a TIMEOUT status
		var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

		// get an eventhub once the fabric client has a user assigned. The user
		// is required bacause the event registration must be signed
		let event_hub = channel.newChannelEventHub(peer);

		// using resolve the promise so that result status may be processed
		// under the then clause rather than having the catch clause process
		// the status
		let txPromise = new Promise((resolve, reject) => {
			let handle = setTimeout(() => {
				event_hub.unregisterTxEvent(transaction_id_string);
				event_hub.disconnect();
				resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
			}, 3000);
			event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
				// this is the callback for transaction event status
				// first some clean up of event listener
				clearTimeout(handle);

				// now let the application know what happened
				var return_status = {event_status : code, tx_id : transaction_id_string};
				if (code !== 'VALID') {
					console.error('The transaction was invalid, code = ' + code);
					resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
				} else {
					console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
					resolve(return_status);
				}
			}, (err) => {
				//this is the callback if something goes wrong with the event registration or processing
				reject(new Error('There was a problem with the eventhub ::'+err));
			},
				{disconnect: true} //disconnect when complete
			);
			event_hub.connect();

		});
		promises.push(txPromise);

		return Promise.all(promises);
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	// check the results in the order the promises were added to the promise all list
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
	} else {
		console.error('Failed to order the transaction. Error code: ' + results[0].status);
	}

	if(results && results[1] && results[1].event_status === 'VALID') {
		console.log('Successfully committed the change to the ledger by the peer');
	} else {
		console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
	}
}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
});
 //res.render('add');
 console.log(car);
res.render('persons', {title: '汽车系统', datas: []});
  
});





router.post('/search', function (req, res) {
var name = req.body.s_name;
var funname='queryCar';

if(name=='')
 funname='queryAllCars';
'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

//
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;
let re = [];
// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
 Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('user1', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user1 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}

	// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
	// queryAllCars chaincode function - requires no arguments , ex: args: [''],

	const request = {
		//targets : --- letting this default to the peers assigned to the channel
		chaincodeId: 'fabcar',
		fcn: funname,
		args: [name]
	};

	// send the query proposal to the peer
	return channel.queryByChaincode(request);
}).then((query_responses) => {
	console.log("Query has completed, checking results");
	// query_responses could have more than one  results if there multiple peers were used as targets
	if (query_responses && query_responses.length == 1) {
		if (query_responses[0] instanceof Error) {
			console.error("error from query = ", query_responses[0]);
		} else {


  
  

    
var h=query_responses[0].toString();
var json = JSON.parse(h);
//json.car=name;
console.log(json);
if(name==''){
res.render("persons",{title: '汽车系统', datas: json});}
if(name!='')
{json.car=name;
res.render("persons",{title: '汽车系统', datas: [json]});}
 



}
 
 return query_responses[0].toString();	

  	
	} else {
		console.log("No payloads were returned from query");
	}
}).catch((err) => {
res.render('persons', {title: '汽车系统', datas: []});
	console.error('Failed to query successfully :: ' + err);
});
});
module.exports = router;
