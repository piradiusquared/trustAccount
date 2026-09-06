import { getDatabase } from '../lib/database';
import { v7 as uuidv7 } from 'uuid';
import { CreateRentInput, RentRecord } from '../lib/datatypes';


export const RentManager = {
    async getAll(): Promise<RentRecord[]> {
        const db = await getDatabase();
        return await db.select<RentRecord[]>('SELECT * FROM rent ORDER BY nextDue ASC');
    }
}