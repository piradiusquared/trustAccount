import { getDatabase } from '../lib/database';
import { LeaseRecord, CreateLeaseInput, EntityId, IsoDate } from '../lib/datatypes';
import { mapLeaseFromDb, booleanToSql } from './utils';

export interface LeaseWithPropertyDetails extends LeaseRecord {
  propertyAddress: string;
}

export const leaseService = {
  // Fetch only active leases (ignoring historic/expired ones)
  async getActive(): Promise<LeaseWithPropertyDetails[]> {
    const db = await getDatabase();
    const raws = await db.select<any[]>(
      `SELECT l.*, p.address as propertyAddress 
       FROM leases l
       INNER JOIN properties p ON l.propertyId = p.id
       WHERE l.status = 'active'`
    );
    return raws.map((raw) => mapLeaseFromDb(raw) as LeaseWithPropertyDetails);
  },

  // Create a lease
  async create(input: CreateLeaseInput): Promise<LeaseRecord> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const record: LeaseRecord = {
      ...input,
      id: crypto.randomUUID(),
      status: input.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    await db.execute(
      `INSERT INTO leases (
        id, propertyId, tenantName, startDate, endDate, rentFrequency, rentCents,
        bondCents, existingTenantCreditCents, tenantCount, petsAllowed, petCount,
        specialConditionNotes, actualMoveOutDate, lettingFeeSelection, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id, record.propertyId, record.tenantName, record.startDate, record.endDate, record.rentFrequency, record.rentCents,
        record.bondCents, record.existingTenantCreditCents, record.tenantCount, 
        booleanToSql(record.petsAllowed), // Maps boolean to 1 or 0
        record.petCount, record.specialConditionNotes, record.actualMoveOutDate, record.lettingFeeSelection,
        record.status, record.createdAt, record.updatedAt
      ]
    );
    return record;
  },

  // Terminate/Expire a lease
  async terminateLease(id: EntityId, moveOutDate: IsoDate): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.execute(
      `UPDATE leases 
       SET status = 'historic', actualMoveOutDate = ?, updatedAt = ? 
       WHERE id = ?`,
      [moveOutDate, now, id]
    );
  }
};