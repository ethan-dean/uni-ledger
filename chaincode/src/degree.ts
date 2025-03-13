import {Object, Property} from 'fabric-contract-api';

@Object()
export class Degree {
    @Property()
    public docType?: string;

    @Property()
    public ID: string = '';

    // University - The institution awarding the degree
    @Property()
    public University: string = '';

    // College - The specific school or division within the university
    @Property()
    public College: string = '';

    // Program - The field of study or major
    @Property()
    public Program: string = '';

    // Honors - The distinctions on degree
    @Property()
    public Honors?: string = '';

    // Specialization - The specific focus area within program
    @Property()
    public Specialization?: string = '';

    // Degree Name - The formal name
    @Property()
    public DegreeName: string = '';

    // Degree Level - Bachelor's, Master's, Ph.D, etc.
    @Property()
    public DegreeLevel: string = '';

    // Owner - The recipient of the degree
    @Property()
    public Owner: string = '';

    // Year - The year the degree was conferred
    @Property()
    public Year: number = 0;

    // Accreditation - Whether the degree is backed by the university
    @Property()
    public Accreditation: boolean = false;
}
