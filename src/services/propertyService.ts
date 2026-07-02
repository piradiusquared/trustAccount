import { getDatabase } from "../lib/database";

export interface Property {
    id?: number;
    owner_id: number;
    address: string;
    property_type: string;
}

export const propertyService = {
    async getAllProperties(): Promise<Property[]> {
        const db = await getDatabase();
        return await db.select<Property[]>('SELECT * FROM properties');
    },
    
    // Fetch properties belonging to a specific owner (Relational Query)
    async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
        const db = await getDatabase();
        return await db.select<Property[]>(
        'SELECT * FROM properties WHERE owner_id = ?',
        [ownerId]
        );
    },

    // Insert a property
    async createProperty(property: Omit<Property, 'id'>): Promise<void> {
        const db = await getDatabase();
        await db.execute(
        'INSERT INTO properties (owner_id, address, property_type) VALUES (?, ?, ?)',
        [property.owner_id, property.address, property.property_type]
        );
    }
}

