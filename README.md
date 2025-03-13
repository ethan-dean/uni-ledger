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
Create your new project directory:
```bash
mkdir uni-ledger
cd uni-ledger
```

Download the install script from github:
```bash
git clone https://github.com/ethan-dean/uni-ledger.git && chmod +x install-fabric.sh
```

Run the script with below settings(docker images v2.5, binaries v2.5):
Run the script with the -h option to see other options, such as versioning or selecting which downloads you get.
```bash
./install-fabric.sh --fabric-version 2.5.11 --ca-version 1.5.15 docker binary 
```

---

## **3️⃣  Launch Blockchain Network and Implement Smart Contract**
Switch to the network folder:
```bash
cd fabric-samples/test-network
```

Clean start the Fabric network (default channel name "mychannel"):
```bash
./network.sh down
./network.sh up createChannel -c degreeChannel -ca
```

Deploy the certificate chaincode(ccn=cc-name, ccp=cc-path, ccl=cc-language):
```bash
./network.sh deployCC -ccn basic -ccp ../../chaincode/src -ccl typescript
```

---

## **4️⃣  Validate Contract with Fabric Peer API**

---

## **5️⃣ CCreate API for Universities & Employers**

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
