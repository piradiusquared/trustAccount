import { getDatabase } from '../lib/database';
import { OwnerRecord, CreateOwnerInput, EntityId } from '../lib/datatypes';
import { getLocalIsoString } from './utils';

export const ownerService = {
  // Fetch all owners
  async getAll(): Promise<OwnerRecord[]> {
    const db = await getDatabase();
    return await db.select<OwnerRecord[]>('SELECT * FROM owners ORDER BY reference ASC');
  },

  // TODO: not done yet, add in active/inactive flag
  async getInactive(): Promise<OwnerRecord[]> {
    const db = await getDatabase();
    return await db.select<OwnerRecord[]>('SELECT * FROM owners');
  },

  // Fetch a single owner
  async getById(id: EntityId): Promise<OwnerRecord | null> {
    const db = await getDatabase();
    const results = await db.select<OwnerRecord[]>('SELECT * FROM owners WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
  },

  // Create a new owner
  async create(input: CreateOwnerInput): Promise<OwnerRecord> {
    const db = await getDatabase();
    const now = getLocalIsoString();
    
    const record: OwnerRecord = {
      ...input,
      id: crypto.randomUUID(), // Standard UUID generation
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await db.execute(
      `INSERT INTO owners (
        id, reference, title, firstName, surname, email, mobile, postalAddress,
        bankName, accountName, bsb, accountNumber, paymentRef, notes, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id, record.reference, record.title, record.firstName, record.surname, record.email, record.mobile, record.postalAddress,
        record.bankName, record.accountName, record.bsb, record.accountNumber, record.paymentRef, record.notes, record.status, record.createdAt, record.updatedAt
      ]
    );
    return record;
  },

  // Update an existing owner
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

  async setActivity(id: EntityId, active: boolean): Promise<void> {
    const db = await getDatabase();
    const now = getLocalIsoString();

    const results = await db.select<{ status: string }[]>('SELECT status FROM owners WHERE id = ?', [id]);
    if (!results || results.length === 0) return;

    const curr = results[0].status;
    const newStatus = active ? 'active' : 'inactive';
    if (curr === newStatus) return;

    await db.execute('UPDATE owners SET status = ?, updatedAt = ? WHERE id = ?', [newStatus, now, id]);
  },

  

  // Delete an owner (if owner is associated with property or lease, popup warning, cannot cascade)
  async delete(id: EntityId): Promise<number> {
    const db = await getDatabase();
    // check for any foreign references first, then return either 0 or 1 based on success/fail
    await db.execute('DELETE FROM owners WHERE id = ?', [id]);
    return 0;
  }
};