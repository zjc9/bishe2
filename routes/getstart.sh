#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first erro
rm -rf ./wallet/
set -ex


export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"go"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`
if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang"  ]; then
	CC_RUNTIME_LANGUAGE=golang
	CC_SRC_PATH=github.com/hyperledger/fabric-samples/chaincode/test1/go
  CC_SRC_PATH1=github.com/hyperledger/fabric-samples/chaincode/grade/go
    CC_SRC_PATH2=github.com/hyperledger/fabric-samples/chaincode/manager/go


	echo Vendoring Go dependencies ...
	pushd ../chaincode/grade/go
	GO111MODULE=on go mod vendor
	popd
	echo Finished vendoring Go dependencies
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_RUNTIME_LANGUAGE=java
	CC_SRC_PATH=/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/fabcar/java/build/install/fabcar
  echo Compiling Java code ...
  pushd ../chaincode/fabcar/java
  ./gradlew installDist
  popd
  echo Finished compiling Java code
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH=/opt/gopath/src/github.com/fabric-samples/chaincode/fabcar/javascript/lib
elif [ "$CC_SRC_LANGUAGE" = "typescript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH=/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/fabcar/typescript
	echo Compiling TypeScript code into JavaScript ...
	pushd ../chaincode/fabcar/typescript
	npm install
	npm run build
	popd
	echo Finished compiling TypeScript code into JavaScript
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and typescript
	exit 1
fi


# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
pushd ../first-network
echo y | ./byfn.sh down
echo y | ./byfn.sh up -a -n -s couchdb
popd

CONFIG_ROOT=/opt/gopath/src/github.com/hyperledger/fabric/peer
ORG1_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
ORG1_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
ORG2_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
ORG2_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
ORDERER_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

PEER0_ORG1="docker exec
-e CORE_PEER_LOCALMSPID=Org1MSP
-e CORE_PEER_ADDRESS=peer0.org1.example.com:7051
-e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH}
-e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE}
cli
peer
--tls=true
--cafile=${ORDERER_TLS_ROOTCERT_FILE}
--orderer=orderer.example.com:7050"

PEER1_ORG1="docker exec
-e CORE_PEER_LOCALMSPID=Org1MSP
-e CORE_PEER_ADDRESS=peer1.org1.example.com:8051
-e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH}
-e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE}
cli
peer
--tls=true
--cafile=${ORDERER_TLS_ROOTCERT_FILE}
--orderer=orderer.example.com:7050"

PEER0_ORG2="docker exec
-e CORE_PEER_LOCALMSPID=Org2MSP
-e CORE_PEER_ADDRESS=peer0.org2.example.com:9051
-e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH}
-e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE}
cli
peer
--tls=true
--cafile=${ORDERER_TLS_ROOTCERT_FILE}
--orderer=orderer.example.com:7050"

PEER1_ORG2="docker exec
-e CORE_PEER_LOCALMSPID=Org2MSP
-e CORE_PEER_ADDRESS=peer1.org2.example.com:10051
-e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH}
-e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE}
cli
peer
--tls=true
--cafile=${ORDERER_TLS_ROOTCERT_FILE}
--orderer=orderer.example.com:7050"

echo "在peer0.example.org1.com打包智能合约"
${PEER0_ORG1} lifecycle chaincode package \
  student.tar.gz \
  --path "$CC_SRC_PATH" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label studentv1

echo "安装智能合约"
${PEER0_ORG1} lifecycle chaincode install  student.tar.gz
echo "Installing smart contract on peer1.org1.example.com"
${PEER1_ORG1} lifecycle chaincode install  student.tar.gz


echo "Determining package ID for smart contract on peer0.org1.example.com"
REGEX='Package ID: (.*), Label: studentv1'
if [[ `${PEER0_ORG1} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG1=${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org1.example.com
  exit 1
fi


echo "审批student链码"
${PEER0_ORG1} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG1} \
  --channelID mychannel \
  --name students \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent




#组织二
echo "在org2上打包链码"
${PEER0_ORG2} lifecycle chaincode package \
  student.tar.gz \
  --path "$CC_SRC_PATH" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label studentv1

echo "安装信息链码"
${PEER0_ORG2} lifecycle chaincode install student.tar.gz
echo "安装信息链码"
${PEER1_ORG2} lifecycle chaincode install student.tar.gz

echo "Determining package ID for smart contract on peer0.org2.example.com"
REGEX='Package ID: (.*), Label: studentv1'
if [[ `${PEER0_ORG2} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG2=${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org2.example.com
  exit 1
fi


echo "审批学生信息链码"
${PEER0_ORG2} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG2} \
  --channelID mychannel \
  --name students \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent




echo "提交mychannel通道中链码定义"
${PEER0_ORG1} lifecycle chaincode commit \
  --channelID mychannel \
  --name students \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}




# echo "The transaction is sent to all of the peers so that chaincode is built before receiving the following requests"
${PEER0_ORG1} chaincode invoke \
  -C mychannel \
  -n students \
  -c '{"function":"initLedger","Args":[]}' \
  --waitForEvent \
  --waitForEventTimeout 300s \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}





# Temporary workaround (see FAB-15897) - cannot invoke across all four peers at the same time, so use a query to build
# 查询
${PEER1_ORG1} chaincode query \
  -C mychannel \
  -n students \
  -c '{"function":"QueryAllStudents","Args":[]}' \
  --peerAddresses peer1.org1.example.com:8051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE}
${PEER1_ORG2} chaincode query \
  -C mychannel \
  -n students \
  -c '{"function":"QueryAllStudents","Args":[]}' \
  --peerAddresses peer1.org2.example.com:10051 \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}






 echo "grade  channel++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"


#打包
${PEER0_ORG1} lifecycle chaincode package \
  grade.tar.gz \
  --path "$CC_SRC_PATH1" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label gradev1
#安装
${PEER0_ORG1} lifecycle chaincode install \
  grade.tar.gz
${PEER1_ORG1} lifecycle chaincode install \
  grade.tar.gz
#验证
echo "Determining package ID for smart contract on peer0.org1.example.com"
REGEX='Package ID: gradev1(.*), Label: gradev1'
if [[ `${PEER0_ORG1} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG1_GRADE=gradev1${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org1.example.com
  exit 1
fi
#审批
${PEER0_ORG1} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG1_GRADE} \
  --channelID grade \
  --name grades \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent

# z组织二
echo "在org2上打包链码"
${PEER0_ORG2} lifecycle chaincode package \
  grade.tar.gz \
  --path "$CC_SRC_PATH1" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label gradev1

echo "安装成绩链码"
${PEER0_ORG2} lifecycle chaincode install grade.tar.gz
echo "安装成绩链码"
${PEER1_ORG2} lifecycle chaincode install grade.tar.gz

echo "Determining package ID for smart contract on peer0.org2.example.com"
REGEX='Package ID: gradev1(.*), Label: gradev1'
if [[ `${PEER0_ORG2} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG2_GRADE=gradev1${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org2.example.com
  exit 1
fi
echo "审批成绩链码"
${PEER0_ORG2} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG2_GRADE}  \
  --channelID grade \
  --name grades \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1  \
  --waitForEvent


echo "提交grade通道中链码定义"
${PEER0_ORG1} lifecycle chaincode commit \
  --channelID grade \
  --name grades \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}


  # grade channel invoke
  ${PEER0_ORG1} chaincode invoke \
  -C grade \
  -n grades \
  -c '{"function":"initLedger","Args":[]}' \
  --waitForEvent \
  --waitForEventTimeout 300s \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}

  
${PEER1_ORG1} chaincode query \
  -C grade \
  -n grades \
  -c '{"function":"QueryAllGrades","Args":[]}' \
  --peerAddresses peer1.org1.example.com:8051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE}
${PEER1_ORG2} chaincode query \
  -C grade \
  -n grades \
  -c '{"function":"QueryAllGrades","Args":[]}' \
  --peerAddresses peer1.org2.example.com:10051 \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}

echo "grade  channel++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"


#打包
${PEER0_ORG1} lifecycle chaincode package \
  teacher.tar.gz \
  --path "$CC_SRC_PATH2" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label teacherv1
#安装
${PEER0_ORG1} lifecycle chaincode install \
  teacher.tar.gz
${PEER1_ORG1} lifecycle chaincode install \
  teacher.tar.gz
#验证
echo "Determining package ID for smart contract on peer0.org1.example.com"
REGEX='Package ID: teacherv1(.*), Label: teacherv1'
if [[ `${PEER0_ORG1} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG1_T=teacherv1${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org1.example.com
  exit 1
fi
#审批
${PEER0_ORG1} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG1_T} \
  --channelID manager \
  --name teacher \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent

# z组织二
echo "在org2上打包链码"
${PEER0_ORG2} lifecycle chaincode package \
  teacher.tar.gz \
  --path "$CC_SRC_PATH2" \
  --lang "$CC_RUNTIME_LANGUAGE" \
  --label teacherv1

echo "安装成绩链码"
${PEER0_ORG2} lifecycle chaincode install teacher.tar.gz
echo "安装成绩链码"
${PEER1_ORG2} lifecycle chaincode install teacher.tar.gz

echo "Determining package ID for smart contract on peer0.org2.example.com"
REGEX='Package ID: teacherv1(.*), Label: teacherv1'
if [[ `${PEER0_ORG2} lifecycle chaincode queryinstalled` =~ $REGEX ]]; then
  PACKAGE_ID_ORG2_T=teacherv1${BASH_REMATCH[1]}
else
  echo Could not find package ID for fabcarv1 chaincode on peer0.org2.example.com
  exit 1
fi
echo "审批成绩链码"
${PEER0_ORG2} lifecycle chaincode approveformyorg \
  --package-id ${PACKAGE_ID_ORG2_T}  \
  --channelID manager \
  --name teacher \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1  \
  --waitForEvent


echo "提交grade通道中链码定义"
${PEER0_ORG1} lifecycle chaincode commit \
  --channelID manager \
  --name teacher \
  --version 1.0 \
  --signature-policy "AND('Org1MSP.member','Org2MSP.member')" \
  --sequence 1 \
  --waitForEvent \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}


  # grade channel invoke
  ${PEER0_ORG1} chaincode invoke \
  -C manager \
  -n teacher \
  -c '{"function":"initLedger","Args":[]}' \
  --waitForEvent \
  --waitForEventTimeout 300s \
  --peerAddresses peer0.org1.example.com:7051 \
  --peerAddresses peer0.org2.example.com:9051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}

  
${PEER1_ORG1} chaincode query \
  -C manager \
  -n teacher \
  -c '{"function":"QueryAllMangers","Args":[]}' \
  --peerAddresses peer1.org1.example.com:8051 \
  --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE}
${PEER1_ORG2} chaincode query \
  -C manager \
  -n teacher \
  -c '{"function":"QueryAllMangers","Args":[]}' \
  --peerAddresses peer1.org2.example.com:10051 \
  --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}



  # peer lifecycle chaincode checkcommitreadiness --channelID mychannel  --name students --version 1 --sequence 2 --output json --init-required
 cd /home/zjc/project/hello/routes
 sudo node enrollAdmin.js
sudo node registerUser.js
sudo node registerUser2.js
sudo node query.js
sudo rm -rf ../koa/wallet/*
sudo cp ./wallet/* ../koa/wallet/
echo -e "\033[32m 运行完成 \033[0m" ~                                                                                                                                                                                                         ~                                      
#peer lifecycle chaincode approveformyorg --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel  --name students --version 1.0 --init-required --package-id studentv1:fdc302c90007da3572403e4ba23c3a637bf92bd99b5e511493a9936f476a0aa5  --sequence 2 --waitForEvent
