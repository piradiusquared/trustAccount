import { getDatabase } from '../lib/database';
import { v7 as uuidv7 } from 'uuid';
import { CreateRentInput, EntityId, RentRecord } from '../lib/datatypes';
import { AUD, dinero, Dinero,  } from 'dinero.js';


export const RentManager = {
    async getAll(): Promise<RentRecord[]> {
        const db = await getDatabase();
        return await db.select<RentRecord[]>('SELECT * FROM rent ORDER BY nextDue ASC');
    },

    // Warning: all calls to function must have rent in cents
    async processRent(id: EntityId, rentInc: number): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        
        const rawEntry = await db.select(
            `SELECT * FROM rent
            WHERE leaseId = ?
            `, [id]
        );
        
        const entry = (rawEntry as RentRecord);
        const rawRent = rentInc + entry.creditCents; // total money available
        const rentDaily = Math.ceil(entry.rentCents / 7);

        const daysPaid = Math.floor(rawRent / rentDaily); // important
        
        const remainder = rawRent - (daysPaid * rentDaily); // money left -> goes to credit
        


        



        
    }
}