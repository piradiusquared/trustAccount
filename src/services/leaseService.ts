
import { getDatabase } from '../lib/database';
import { LeaseRecord, CreateLeaseInput, EntityId, IsoDate, CreateTenantInput } from '../lib/datatypes';
import { mapLeaseFromDb, booleanToSql } from './utils';
import { v7 as uuidv7 } from 'uuid'

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
    async create(input: CreateLeaseInput, tenants: CreateTenantInput[]): Promise<LeaseRecord> {
        const db = await getDatabase();
        const leaseId = uuidv7();
        const now = new Date().toISOString();

        const record: LeaseRecord = {
            ...input,
            id: leaseId,
            status: 'active', // Might need to do some pre-processing checks if lease can be active (i.e. no lease starting in the future)
            createdAt: now,
            updatedAt: now,
        };

        await db.execute(
            `INSERT INTO leases (
        id, propertyId, tenantName, startDate, endDate, rentFrequency, rentCents,
        bondCents, existingTenantCreditCents, tenantCount, petsAllowed, petCount,
        actualMoveOutDate, lettingFeeSelection, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                record.id, record.propertyRef, record.tenantName, record.startDate, record.endDate, record.rentFrequency, record.rentCents,
                record.bondCents, record.existingTenantCreditCents, record.tenantCount,
                booleanToSql(record.petsAllowed), // fix this to be string
                record.petCount, record.actualMoveOutDate, record.lettingFee,
                record.status, record.createdAt, record.updatedAt
            ]
        );

        for (const tenant of tenants) {
            await db.execute(
            `INSERT INTO tenants (
                id, leaseId, firstName, lastName, email, mobile, notes, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                uuidv7(), leaseId, tenant.firstName, tenant.lastName,
                tenant.email, tenant.mobile, tenant.notes, now, now
            ]
            );
        }
        return record;
    },
    // Terminate/Expire a lease
    async terminateLease(id: EntityId, moveOutDate: IsoDate): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        await db.execute(
            `UPDATE leases 
       SET status = 'inactive', actualMoveOutDate = ?, updatedAt = ? 
       WHERE id = ?`,
            [moveOutDate, now, id]
        );
    },

    async createLeaseWithTenants(
      leaseInput: CreateLeaseInput, 
      tenants: CreateTenantInput[] // This array can have a length of 1 to 4
    ): Promise<void> {
      const db = await getDatabase();
      const leaseId = crypto.randomUUID(); // Generate parent UUID first
      const now = new Date().toISOString();

      // 1. Insert the parent Lease record
      await db.execute(
        `INSERT INTO leases (
          id, propertyId, startDate, endDate, rentFrequency, rentCents, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leaseId, leaseInput.propertyId, leaseInput.startDate, leaseInput.endDate, 
          leaseInput.rentFrequency, leaseInput.rentCents, 'active', now, now
        ]
      );

      // 2. Loop through and insert ONLY the actual tenants in the array
      for (const tenant of tenants) {
        await db.execute(
          `INSERT INTO tenants (
            id, leaseId, firstName, lastName, email, mobile, dob, notes, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            crypto.randomUUID(), // Unique UUID for this specific tenant row
            leaseId,             // Foreign key linking back to the parent lease
            tenant.firstName,
            tenant.lastName || null,
            tenant.email || null,
            tenant.mobile || null,
            tenant.dob || null,
            tenant.notes || null,
            now,
            now
          ]
        );
      }
    }
};