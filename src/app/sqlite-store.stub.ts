import type { AppStore } from './store.ts';

export function createSqliteStore(_databasePath: string): AppStore {
  throw new Error('SQLite store is not wired yet. Start with createInMemoryStore() first.');

  /*
  Suggested next step for a local desktop build:

  1. Install a SQLite driver such as better-sqlite3.
  2. Keep the AppStore contract:
     - read(): return the current snapshot
     - write(updater): open a transaction, apply updater, persist the result
  3. Map the state 1:1 into tables:
     - owners
     - properties
     - leases
     - ledger_entries
     - invoices
  4. Use the same app service layer on top of this adapter.

  Example shape:

  import Database from 'better-sqlite3';
  import { createEmptyAppState, type AppState } from './store.ts';

  export function createSqliteStore(databasePath: string): AppStore {
    const db = new Database(databasePath);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS owners (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL,
        first_name TEXT NOT NULL
      );
    `);

    return {
      read(): AppState {
        return createEmptyAppState();
      },
      write(updater) {
        const draft = createEmptyAppState();
        updater(draft);
      },
    };
  }
  */
}

