import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    // Under the hood, this resolves to your OS application-specific data directory
    dbInstance = await Database.load('sqlite:property.db');
  }
  return dbInstance;
}