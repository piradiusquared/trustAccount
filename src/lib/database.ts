import Database from '@tauri-apps/plugin-sql';

// Loading database instance.
let dbInstance: Database | null = null;

/**
 * Pulls the database instance from memory. Skips if already loaded to memory
 * @returns database instance
 */
export async function getDatabase(): Promise<Database> {

    if (!dbInstance) {
        // Resolves to appdata, stored as property.db
        dbInstance = await Database.load('sqlite:property.db');
    }
    return dbInstance;
}