# **Hyperledger Fabric Setup for Certificate Issuance**

## **1️⃣ Prerequisites**
Ensure you have the following installed:  
- **Docker & Docker Compose**  
- **Node.js & npm** (if chosen for chaincode development)  
- **Go** (if chosen for chaincode development)  
- **Java** (if chosen for chaincode development)
- **Fabric Prerequisites** ([List from Hyperledger Docs](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html))  

---

## **2️⃣ Set Up the Fabric Network**

Download the chaincode, test scripts, and resources install script from github:
```bash
git clone https://github.com/ethan-dean/uni-ledger.git && cd uni-ledger
```

Make sure the script is executable:
```bash
chmod +x install-fabric.sh
```

Run the install script with options below:
```bash
./install-fabric.sh --fabric-version 2.5.11 --ca-version 1.5.15 docker binary 
```

---

## **3️⃣  Launch Test Blockchain Network and Deploy Smart Contract**
Switch to the network folder:
```bash
cd fabric-samples/test-network
```

Clean start the Fabric network (use default channel name "mychannel"):
```bash
./network.sh down
./network.sh up createChannel -c mychannel -ca
```

Deploy the certificate chaincode(ccn=cc-name, ccp=cc-path, ccl=cc-language):
```bash
./network.sh deployCC -ccn degree-chaincode -ccp ../../chaincode/ -ccl typescript
```

---

## **4️⃣  Validate Contract with Fabric Peer API**

After deploying the smart contract, you can test it using the Fabric peer CLI.  

First, set the environment variables for Org1’s peer:  

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

Use the following command to initialize the ledger on the chaincode.

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C mychannel \
  -n degree-chaincode \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"InitDegreeLedger","Args":[]}'
```

After invoking a transaction, you can retrieve data using the `query` command.  

```bash
peer chaincode query -C mychannel -n degree-chaincode -c '{"function":"ReadDegree","Args":["degree1"]}'
```

This should return details about the issued certificate.  

---

## **5️⃣ Run API for Universities & Employers**

Install dependencies:
```bash
npm i
```

Start the API:
```bash
npm run start
```

---

## **6️⃣ Test API Endpoints**
### **Issue Certificate (Student)**
```http
POST /requestCertificate
Content-Type: application/json

{
  "studentId": "student1",
  "name": "John Doe",
  "course": "Blockchain 101"
}
```

### **Verify Certificate (Employer)**
```http
GET /verifyCertificate/student1?employerId=employer1
```

---
