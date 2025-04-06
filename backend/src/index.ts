import express, { Request, Response } from 'express';
import cors from 'cors';
import { createGateway, getContracts, createWallet } from './fabric';
import * as config from './config';

const app = express();
const port = config.port || 3000;

// Middleware
app.use(express.json());
app.use(cors());

let contracts: any; // Store contract instances globally

// Initialize Fabric connection once when the server starts
async function initFabric() {
    try {
        console.log('Connecting to Fabric network...');
        const gateway = await createGateway(config.connectionProfileOrg1, config.mspIdOrg1, await createWallet());
        const network = await gateway.getNetwork(config.channelName);
        contracts = await getContracts(network);
        console.log('Fabric connection established.');
        /* debug */
        console.log('\n')
        console.log('Contracts found ');
        console.log(contracts);
        console.log('\n\n')
        /* debug */
    } catch (error) {
        console.error('Failed to initialize Fabric connection:', error);
        process.exit(1); // Exit if connection fails
    }
}

// API Endpoints
app.post('/init-ledger', async (req: Request, res: Response) => {
    try {
        await contracts.assetContract.submitTransaction('InitDegreeLedger');
        res.json({ message: 'Degree ledger initialized' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.post('/confer-degree', async (req: Request, res: Response) => {
    try {
        const { id, college, program, honors, specialization, degreeName, degreeLevel, owner, year } = req.body;
        await contracts.assetContract.submitTransaction('ConferDegree', id, college, program, honors, specialization, degreeName, degreeLevel, owner, year.toString());
        res.json({ message: `Degree ${id} conferred` });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.put('/update-accreditation', async (req: Request, res: Response) => {
    try {
        const { id, accreditation } = req.body;
        await contracts.assetContract.submitTransaction('UpdateDegreeAccreditation', id, accreditation.toString());
        res.json({ message: `Degree ${id} accreditation updated to ${accreditation}` });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get('/read-degree/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await contracts.assetContract.evaluateTransaction('ReadDegree', id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
});

// Start server and initialize Fabric
initFabric().then(() => {
    app.listen(port, () => {
        console.log(`REST API server running on http://localhost:${port}`);
    });
});
