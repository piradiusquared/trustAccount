import { getDatabase } from '../lib/database';
import { v7 as uuidv7 } from 'uuid';
import { CreateRentInput, EntityId, RentRecord } from '../lib/datatypes';
import { AUD, dinero, Dinero,  } from 'dinero.js';


export const RentManager = {
    async getAll(): Promise<RentRecord[]> {
        const db = await getDatabase();
        return await db.select<RentRecord[]>('SELECT * FROM rent ORDER BY nextDue ASC');
    },

    // // Warning: all calls to function must have rent in cents
    // async processRent(id: EntityId, rentInc: number): Promise<void> {
    //     const db = await getDatabase();
    //     const now = new Date().toISOString();
        
    //     const rawEntry = await db.select(
    //         `SELECT * FROM rent
    //         WHERE leaseId = ?
    //         `, [id]
    //     );
        
    //     const entry = (rawEntry as RentRecord);
    //     const rawPayment = rentInc + entry.creditCents; // total money available
    //     const rentDaily = Math.ceil(entry.rentCents / 7);

    //     const daysPaid = Math.floor(rawPayment / rentDaily); // important
    //     let paidTo = Date.parse(entry.paidTo);
    //     const newPaidTo = 
        
        
    //     const newCredit = rawPayment - (daysPaid * rentDaily); // money left -> goes to credit
    // }

    async processRent(id: EntityId, rentInc: number): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const rows = await db.select<RentRecord[]>(
        `SELECT * FROM rent WHERE leaseId = ?`,
        [id]
        );

        if (rows.length === 0) {
        throw new Error(`No rent record found for leaseId: ${id}`);
        }

        const entry = rows[0];

        const rawPayment = rentInc + entry.creditCents;
        const daysPaid = Math.floor((rawPayment * 7) / entry.rentCents);
        const daysLeft = entry.daysLeft + daysPaid;

        const costOfDays = Math.floor((daysPaid * entry.rentCents) / 7);
        const leaseRemain = entry.leaseRemainCents - costOfDays;
        const newCredit = rawPayment - costOfDays;

        const paidToDate = new Date(entry.paidTo);
        paidToDate.setUTCDate(paidToDate.getUTCDate() + daysPaid);
        const newPaidTo = paidToDate.toISOString();

        // 4. Save the updated paidTo, creditCents, and updatedAt back to SQLite
        await db.execute(
            `UPDATE rent 
            SET paidTo = ?, creditCents = ?, daysLeft = ?, leaseRemainCents = ?, updatedAt = ? 
            WHERE leaseId = ?`,
            [newPaidTo, newCredit, daysLeft, leaseRemain, now, id]
        );
    }
}