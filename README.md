# **Hyperledger Fabric Setup for Certificate Issuance**

## **1️⃣ Prerequisites**
Ensure you have the following installed:  
- **Docker & Docker Compose**  
- **Node.js & npm**  
- **Go** (for chaincode development)  
- **Fabric Prerequisites** ([List from Hyperledger Docs](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html))  
- **Fabric Binaries** ([Download from Hyperledger Docs](https://hyperledger-fabric.readthedocs.io/en/latest/install.html))  

---

## **2️⃣ Set Up the Fabric Network**
Create your new project directory:
```bash
mkdir uni-ledger
cd uni-ledger
```

Download the install script from github:
```bash
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
```

Run the script with default settings, the defaults provide what we need (fabric-samples github repo, docker images, binaries):
Run the script with the -h option to see other options, such as versioning or selecting which downloads you get.
```bash
./install-fabric.sh
```

---

## **3️⃣ Implement Smart Contract**
Create new directory for certificate chaincode:
```bash
mkdir -p certificate/chaincode
cd certificate/chaincode
```

Create a **certificate chaincode** in `fabric-samples/chaincode/certificate/index.js`:
```javascript
'use strict';

const { Contract } = require('fabric-contract-api');

class CertificateContract extends Contract {
    async issueCertificate(ctx, studentId, name, course) {
        const certificate = { studentId, name, course, verified: false };
        await ctx.stub.putState(studentId, Buffer.from(JSON.stringify(certificate)));
        return `Certificate issued for ${name}`;
    }

    async verifyCertificate(ctx, studentId) {
        const certificateBytes = await ctx.stub.getState(studentId);
        if (!certificateBytes || certificateBytes.length === 0) {
            throw new Error(`No certificate found for student ${studentId}`);
        }
        return certificateBytes.toString();
    }
}

module.exports = CertificateContract;
```

Switch to the network folder:
```bash
cd fabric-samples/test-network
```

Start the Fabric network (default channel name "mychannel"):
```bash
./network.sh down
./network.sh up createChannel -ca
```

Deploy the **certificate chaincode** (ccn=cc-name, ccp=cc-path, ccl=cc-language):
```bash
./network.sh deployCC -ccn certificate -ccp ../chaincode/certificate -ccl javascript
```

---

## **4️⃣ Register Users**
Run the script to register users in `fabric-samples/application-javascript/registerUser.js`:
```javascript
'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const ccpPath = path.resolve(__dirname, '../test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const walletPath = path.join(__dirname, 'wallet');

async function registerUser(userId, affiliation) {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('Admin identity not found. Run enrollAdmin.js first.');
        return;
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    const secret = await ca.register({ affiliation, enrollmentID: userId, role: 'client' }, adminUser);
    const enrollment = await ca.enroll({ enrollmentID: userId, enrollmentSecret: secret });
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };
    await wallet.put(userId, x509Identity);
    console.log(`Successfully registered ${userId} with affiliation ${affiliation}`);
}

// Register student, employer, and admin users
registerUser('student1', 'org1.department1');
registerUser('employer1', 'org1.department2');
registerUser('admin1', 'org1.admin');
```

Run the script:
```bash
node registerUser.js
```

---

## **5️⃣ Create API for Students & Employers**
Create `server.js` to provide REST API:
```javascript
'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ccpPath = path.resolve(__dirname, '../test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const walletPath = path.join(__dirname, 'wallet');

async function connectToNetwork(userId) {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const userIdentity = await wallet.get(userId);
    if (!userIdentity) {
        throw new Error(`User ${userId} not found in wallet. Register first.`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('certificate');
    return { gateway, contract };
}

// Student requests certificate
app.post('/requestCertificate', async (req, res) => {
    try {
        const { studentId, name, course } = req.body;
        const { gateway, contract } = await connectToNetwork(studentId);
        await contract.submitTransaction('issueCertificate', studentId, name, course);
        await gateway.disconnect();
        res.json({ message: 'Certificate requested successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Employer verifies certificate
app.get('/verifyCertificate/:studentId', async (req, res) => {
    try {
        const employerId = req.query.employerId;
        const studentId = req.params.studentId;
        const { gateway, contract } = await connectToNetwork(employerId);
        const result = await contract.evaluateTransaction('verifyCertificate', studentId);
        await gateway.disconnect();
        res.json({ certificate: result.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

Install dependencies:
```bash
npm init -y
npm install express fabric-network cors body-parser
```

Start the API:
```bash
node server.js
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

## **🎯 Summary**
✔ **Set up Hyperledger Fabric network**  
✔ **Deployed chaincode for certificate issuance**  
✔ **Registered students and employers**  
✔ **Created REST API for interactions**  
