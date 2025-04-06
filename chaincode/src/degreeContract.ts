import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Degree} from './degree';

@Info({title: 'DegreeContract', description: 'Smart contract for tracking degrees'})
export class DegreeContract extends Contract {

    @Transaction()
    public async InitDegreeLedger(ctx: Context): Promise<void> {
        const degrees: Degree[] = [
            {
                ID: 'degree1',
                University: 'University of Central Florida',
                College: 'College of Engineering and Computer Science',
                Program: 'Computer Science',
                Honors: '',
                Specialization: '',
                DegreeName: 'Bachelor\'s of Computer Science',
                DegreeLevel: 'Bachelor\'s',
                Owner: 'Ethan Dean',
                Year: 2026,
                Accreditation: true,
            },
            {
                ID: 'degree2',
                University: 'University of Florida',
                College: 'Herbert Wertheim College of Engineering',
                Program: 'Mechanical Engineering',
                Honors: '',
                Specialization: '',
                DegreeName: 'Bachelor\'s of Mechanical Engineering',
                DegreeLevel: 'Bachelor\'s',
                Owner: 'William Joel',
                Year: 2004,
                Accreditation: true,
            },
            {
                ID: 'degree3',
                University: 'Massachusetts Institute of Technology',
                College: 'School of Engineering',
                Program: 'Electrical Engineering and Computer Science',
                Honors: 'Summa Cum Laude',
                Specialization: 'Artificial Intelligence',
                DegreeName: 'Bachelor\'s of Electrical Engineering and Computer Science',
                DegreeLevel: 'Bachelor\'s',
                Owner: 'Alice Johnson',
                Year: 2018,
                Accreditation: true,
            },
            {
                ID: 'degree4',
                University: 'Stanford University',
                College: 'School of Humanities and Sciences',
                Program: 'Mathematics',
                Honors: 'Magna Cum Laude',
                Specialization: 'Computational Mathematics',
                DegreeName: 'Bachelor\'s of Science in Mathematics',
                DegreeLevel: 'Bachelor\'s',
                Owner: 'Michael Lee',
                Year: 2022,
                Accreditation: true,
            },
            {
                ID: 'degree5',
                University: 'Harvard University',
                College: 'Harvard Business School',
                Program: 'Business Administration',
                Honors: '',
                Specialization: 'Finance',
                DegreeName: 'Master\'s of Business Administration',
                DegreeLevel: 'Master\'s',
                Owner: 'Sophia Martinez',
                Year: 2015,
                Accreditation: true,
            },
            {
                ID: 'degree6',
                University: 'California Institute of Technology',
                College: 'Division of Physics, Mathematics, and Astronomy',
                Program: 'Physics',
                Honors: '',
                Specialization: 'Quantum Mechanics',
                DegreeName: 'Doctor of Philosophy in Physics',
                DegreeLevel: 'PhD',
                Owner: 'Daniel Carter',
                Year: 2010,
                Accreditation: true,
            }
        ];

        for (const degree of degrees) {
            degree.docType = 'degree';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(degree.ID, Buffer.from(stringify(sortKeysRecursive(degree))));
            console.info(`Degree ${degree.ID} initialized`);
        }
    }

    // ConferDegree issues a new degree to the world state with given details.
    @Transaction()
    public async ConferDegree(ctx: Context,
                                id: string,
                                college: string,
                                program: string,
                                honors: string,
                                specialization: string,
                                degreeName: string,
                                degreeLevel: string,
                                owner: string,
                                year: number
    ): Promise<void> {
        // Throws error if client MSP ID not found in map
        const requestingUniversityName: string = this.GetUniversityName(ctx);

        const exists = await this.DegreeExists(ctx, id);
        if (exists) {
            throw new Error(`The degree ${id} already exists`);
        }

        const degree: Degree = {
            ID: id,
            University: requestingUniversityName,
            College: college,
            Program: program,
            Honors: honors,
            Specialization: specialization,
            DegreeName: degreeName,
            DegreeLevel: degreeLevel,
            Owner: owner,
            Year: year,
            Accreditation: true,
        };

        // Ensure deterministic serialization before storing.
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(degree))));
    }

    // UpdateDegreeAccreditation updates an existing degrees accreditation by its university.
    @Transaction()
    public async UpdateDegreeAccreditation(ctx: Context,
                                            id: string,
                                            accreditation: boolean
    ): Promise<void> {
        // Throws error if client MSP ID not found in map
        const requestingUniversityName: string = this.GetUniversityName(ctx);

        const exists = await this.DegreeExists(ctx, id);
        if (!exists) {
            throw new Error(`The degree ${id} does not exist`);
        }

        // Retrieve the existing degree from the world state.
        const degreeJSON = await ctx.stub.getState(id);
        if (!degreeJSON || degreeJSON.length === 0) {
            throw new Error(`The degree ${id} does not exist`);
        }
        const degree: Degree = JSON.parse(degreeJSON.toString());
        if (requestingUniversityName !== degree.University) {
            throw new Error(`The degree ${id} does not originate from university <${requestingUniversityName}>.`);
        }

        // Update only the Accreditation field, preserving all other properties.
        degree.Accreditation = accreditation;

        // Write the updated degree back to the world state with deterministic key order.
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(degree))));
    }

    // ReadDegree returns the degree stored in the world state with given id.
    @Transaction(false)
    public async ReadDegree(ctx: Context, id: string): Promise<string> {
        const degreeJSON = await ctx.stub.getState(id);
        if (degreeJSON.length === 0) {
            throw new Error(`The degree ${id} does not exist`);
        }
        return degreeJSON.toString();
    }

    // Utility Function
    // DegreeExists returns true when degree with given ID exists in world state.
    @Returns('boolean')
    public async DegreeExists(ctx: Context, id: string): Promise<boolean> {
        const degreeJSON = await ctx.stub.getState(id);
        return degreeJSON.length > 0;
    }

    // Utility Function
    // GetUniversityName returns university name based on client's MSP ID.
    @Returns('string')
    private GetUniversityName(ctx: Context): string {
        const mspId = ctx.clientIdentity.getMSPID();
        const universityMap: { [key: string]: string } = {
            'Org1MSP': 'University of Organization 1 (Test Data – Not Valid)',
            'Org2MSP': 'University of Organization 2 (Test Data – Not Valid)',
            'UCFMSP': 'University of Central Florida',
            'UFLMSP': 'University of Florida',
            'MITMSP': 'Massachusetts Institute of Technology',
            'STANFORDMSP': 'Stanford University',
            'HARVARDMSP': 'Harvard University',
            'CALTECHMSP': 'California Institute of Technology'
        };

        if (!universityMap[mspId]) {
            throw new Error(`Unauthorized organization: ${mspId}`);
        }
        return universityMap[mspId];
    }
}
