import { getDatabase } from '../lib/database';
import { OwnerRecord, CreateOwnerInput, EntityId } from '../lib/datatypes';

export const ownerService = {
  // Fetch all owners
  async getAll(): Promise<OwnerRecord[]> {
    const db = await getDatabase();
    return await db.select<OwnerRecord[]>('SELECT * FROM owners ORDER BY reference ASC');
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
    const now = new Date().toISOString();
    
    const record: OwnerRecord = {
      ...input,
      id: crypto.randomUUID(), // Standard UUID generation
      createdAt: now,
      updatedAt: now,
    };

    await db.execute(
      `INSERT INTO owners (
        id, reference, title, firstName, surname, email, mobile, postalAddress,
        bankName, accountName, bsb, accountNumber, paymentRef, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id, record.reference, record.title, record.firstName, record.surname, record.email, record.mobile, record.postalAddress,
        record.bankName, record.accountName, record.bsb, record.accountNumber, record.paymentRef, record.notes, record.createdAt, record.updatedAt
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

  // Delete an owner (Properties and Leases will Cascade delete automatically)
  async delete(id: EntityId): Promise<void> {
    const db = await getDatabase();
    await db.execute('DELETE FROM owners WHERE id = ?', [id]);
  }
};