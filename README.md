# **Uni-Ledger**

## **Summary**
Uni-Ledger is a proof-of-concept system that utilizes smart contracts written with the Hyperledger Fabric API to create a secure, immutable distributed network for managing student degree records. The system employs chaincode to enable schools to confer degrees, update accreditation statuses, and correct records as necessary, ensuring that any change in a student’s academic standing is permanently recorded on the blockchain. The system is designed for enterprise use on a private, permissioned network, providing a robust platform that not only maintains the integrity of academic records but also streamlines processes with a REST API. This API offers simple HTTP endpoints that allow schools, employers, and students to interact with the blockchain—whether for adding new records, querying existing ones, or verifying credentials.

## **Purpose**
The primary objective of Uni-Ledger is to overcome the limitations of the current degree verification system, which relies heavily on centralized authorities like the Department of Education—organizations that are vulnerable to budget cuts and reorganization. With declining college enrollments and the associated risk of small institutions shutting down, there is an urgent need for a dependable method to preserve academic credentials indefinitely. Uni-Ledger addresses this by allowing educational institutions to host nodes within a decentralized network, ensuring that each degree is verifiable in perpetuity regardless of the institution’s future. Furthermore, the system offers a cost-effective alternative to the expensive third-party verification process, potentially reducing the current fees of $20-40 per verification. By integrating smart contract chaincode and a REST API, Uni-Ledger not only secures and simplifies record-keeping but also lays the groundwork for a more competitive, transparent market for degree verification.

# **Uni-Ledger Smart Contract Test Setup**

## **1️⃣ Prerequisites**
Ensure you have the following installed:  
- **Docker & Docker Compose**  
- **Node.js & npm** (for chaincode development)  
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

Switch to the backend directory:
```bash
cd ../../backend
```

Generate environment variables:
```bash
npm run generateEnv
```

Install dependencies:
```bash
npm i
```

Start the REST API:
```bash
npm run build
node dist/index.js
```

---

## **6️⃣ Test API Endpoints**
### **Initialize Ledger**
```http
POST /initialize-ledger
```

### **Get Degree**
```http
GET /get-degree/:id
```

### **Confer Degree**
```http
POST /confer-degree
Content-Type: application/json

{
    "id": "degree7",
    "college": "test college",
    "program": "test program",
    "honors": "",
    "specialization": "",
    "degreeName": "test degree",
    "degreeLevel": "test level",
    "owner": "test person",
    "year": "2018"
}
```

### **Update Accreditation**
```http
PUT /update-accreditation
Content-Type: application/json

{
    "id": "degree7",
    "accreditation": false
}
```
