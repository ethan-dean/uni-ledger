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
./network.sh deployCC -ccn degree-chaincode -ccp ../../chaincode/src -ccl typescript
```

---

## **4️⃣  Validate Contract with Fabric Peer API**

---

## **5️⃣ Create API for Universities & Employers**

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
