import { v7 as uuidv7 } from 'uuid';
import { getDatabase } from '../lib/database';
import { PropertyRecord, CreatePropertyInput, EntityId } from '../lib/datatypes';

export interface PropertyWithOwner extends PropertyRecord {
    ownerName: string;
}

export const propertyService = {
    /**
     * Fetch ***active*** properties and join the owner's name for your master property list dashboard
     * @returns property records joined with respective owners
     */
    async getActive(): Promise<PropertyRecord[]> {
        const db = await getDatabase();
        return await db.select<PropertyRecord[]>(
            `SELECT p.*, (o.firstName || ' ' || o.lastName) as ownerName
            FROM properties p
            INNER JOIN owners o ON p.ownerId = o.id
            WHERE p.status = 'active'
            ORDER BY p.reference ASC`
        );
    },

    /**
     * Fetch ***inactive*** properties and join the owner's name for your master property list dashboard
     * @returns property records joined with respective owners
     */
    async getInactive(): Promise<PropertyRecord[]> {
        const db = await getDatabase();
        return await db.select<PropertyRecord[]>(
            `SELECT p.*, (o.firstName || ' ' || o.lastName) as ownerName
            FROM properties p
            INNER JOIN owners o ON p.ownerId = o.id
            WHERE p.status = 'inactive'
            ORDER BY p.reference ASC`
        );
    },

    /**
     * Changes the status of a specific property
     * @param id property to update
     * @param status active or inactive
     */
    async updateStatus(id: EntityId, status: 'active' | 'inactive'): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();
        await db.execute(
        'UPDATE properties SET status = ?, updatedAt = ? WHERE id = ?',
        [status, now, id]
        );
    },

    /**
     * Fetch properties belonging to a specific owner
     * @param ownerId owner id to find properties
     * @returns property list belonging to owner
     */
    async getByOwnerId(ownerId: EntityId): Promise<PropertyRecord[]> {
        const db = await getDatabase();
        return await db.select<PropertyRecord[]>('SELECT * FROM properties WHERE ownerId = ?', [ownerId]);
    },

    /**
     * Creates a new property
     * @param input from from the new property form
     * @returns copy of to be inserted data
     */
    async create(input: CreatePropertyInput): Promise<PropertyRecord> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const record: PropertyRecord = {
            ...input,
            id: uuidv7(),
            status: 'active',
            createdAt: now,
            updatedAt: now,
        };

        await db.execute(
            `INSERT INTO properties (
        id, reference, ownerId, propertyType, address, isFurnished, rentFrequency,
        commissionRatePercent, adminFeeCents, backyardMaintenanceFeeCents,
        advertisementFeeCents, agreedSpendingLimitCents, notes, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                record.id, record.reference, record.ownerId, record.propertyType, record.address, record.isFurnished, record.rentFrequency,
                record.commissionRatePercent, record.adminFeeCents, record.backyardMaintenanceFeeCents,
                record.advertisementFeeCents, record.agreedSpendingLimitCents, record.notes, record.status, record.createdAt, record.updatedAt
            ]
        );
        return record;
    }
};