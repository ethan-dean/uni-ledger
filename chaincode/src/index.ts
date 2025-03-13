import {type Contract} from 'fabric-contract-api';
import {DegreeContract} from './degreeContract';

export const contracts: typeof Contract[] = [DegreeContract];
