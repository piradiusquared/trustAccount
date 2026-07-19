import { v7 as uuidv7 } from 'uuid';
import { getDatabase } from '../lib/database';
import { PropertyRecord, CreatePropertyInput, EntityId } from '../lib/datatypes';

export interface PropertyWithOwner extends PropertyRecord {
    ownerName: string;
}

export const propertyService = {
    // Fetch properties and join the owner's name for your master property list dashboard
    async getAllWithOwners(): Promise<PropertyWithOwner[]> {
        const db = await getDatabase();
        return await db.select<PropertyWithOwner[]>(
            `SELECT p.*, (o.firstName || ' ' || o.surname) as ownerName
       FROM properties p
       INNER JOIN owners o ON p.ownerId = o.id
       ORDER BY p.reference ASC`
        );
    },

    // Fetch properties belonging to a specific owner
    async getByOwnerId(ownerId: EntityId): Promise<PropertyRecord[]> {
        const db = await getDatabase();
        return await db.select<PropertyRecord[]>('SELECT * FROM properties WHERE ownerId = ?', [ownerId]);
    },

    // Create a property
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