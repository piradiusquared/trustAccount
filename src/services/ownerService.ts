import { getDatabase } from '../lib/database';
import { OwnerRecord, CreateOwnerInput, EntityId } from '../lib/datatypes';
import { getLocalIsoString } from './utils';
import { v7 as uuidv7 } from 'uuid'

export const ownerService = {
    /**
     * Fetches all owners
     * @returns owner record of ALL owners
     */
    async getAll(): Promise<OwnerRecord[]> {
        const db = await getDatabase();
        return await db.select<OwnerRecord[]>('SELECT * FROM owners ORDER BY reference ASC');
    },

    /**
     * Fetches active owners
     * @returns only active owners
     */
    async getActive(): Promise<OwnerRecord[]> {
        const db = await getDatabase();
        return await db.select<OwnerRecord[]>('SELECT * FROM owners WHERE status = "active" ORDER BY reference ASC');
    },

    /**
     * Fetches inactive owners
     * @returns only inactive owners
     */
    async getInactive(): Promise<OwnerRecord[]> {
        const db = await getDatabase();
        return await db.select<OwnerRecord[]>('SELECT * FROM owners WHERE status = "inactive" ORDER BY reference ASC');
    },

    // Fetch a single owner
    // async getById(id: EntityId): Promise<OwnerRecord | null> {
    //     const db = await getDatabase();
    //     const results = await db.select<OwnerRecord[]>('SELECT * FROM owners WHERE id = ?', [id]);
    //     return results.length > 0 ? results[0] : null;
    // },

    /**
     * Creates a new owner and adds to the database
     * @param input new owner input based on forms
     * @returns copy of to be inserted owner form
     */
    async create(input: CreateOwnerInput): Promise<OwnerRecord> {
        const db = await getDatabase();
        const now = getLocalIsoString();

        const record: OwnerRecord = {
            ...input,
            id: uuidv7(), // uuidv7 generation
            status: "active",
            createdAt: now,
            updatedAt: now,
        };

        await db.execute(
            `INSERT INTO owners (
        id, reference, title, firstName, lastName, email, mobile, postalAddress,
        bankName, accountName, bsb, accountNumber, paymentRef, notes, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                record.id, record.reference, record.title, record.firstName, record.lastName, record.email, record.mobile, record.postalAddress,
                record.bankName, record.accountName, record.bsb, record.accountNumber, record.paymentRef, record.notes, record.status, record.createdAt, record.updatedAt
            ]
        );
        return record;
    },

    // Update an existing owner
    /**
     * Update an existing owner in specific fields
     * @param id owner id to update
     * @param input partial fields to be updated
     */
    async update(id: EntityId, input: Partial<CreateOwnerInput>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        // Dynamically build the set clause to handle partial updates
        const fields = Object.keys(input);
        if (fields.length === 0) return;

        const setClause = fields.map((field) => `${field} = ?`).join(', ') + ', updatedAt = ?';
        const values = fields.map((field) => (input as any)[field]);
        values.push(now, id);

        await db.execute(`UPDATE owners SET ${setClause} WHERE id = ?`, values);
    },

    /**
     * Changes the status of a specific owner
     * @param id ownerid to update
     * @param status active or inactive
     */
    async updateStatus(id: EntityId, status: 'active' | 'inactive'): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.execute(
        'UPDATE owners SET status = ?, updatedAt = ? WHERE id = ?',
        [status, now, id]
        );
    },
    
    /**
     * WORK IN PROGRESS
     * Attempts to delete an owner. If references found, prevent any changes made
     * @param id owner id to delete
     * @returns 0 if successful
     */
    async delete(id: EntityId): Promise<number> {
        const db = await getDatabase();
        // check for any foreign references first, then return either 0 or 1 based on success/fail
        await db.execute('DELETE FROM owners WHERE id = ?', [id]);
        return 0;
    }
};