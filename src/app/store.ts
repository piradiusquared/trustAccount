import type { AppState } from './domain.ts';

export interface AppStore {
  read(): AppState;
  write(updater: (draft: AppState) => void): void;
}

export function createEmptyAppState(): AppState {
  return {
    owners: [],
    properties: [],
    leases: [],
    ledgerEntries: [],
    invoices: [],
  };
}

export function createInMemoryStore(seed?: Partial<AppState>): AppStore {
  return new InMemoryAppStore(seed);
}

export class InMemoryAppStore implements AppStore {
  #state: AppState;

  constructor(seed?: Partial<AppState>) {
    this.#state = mergeState(createEmptyAppState(), seed);
  }

  read(): AppState {
    return structuredClone(this.#state);
  }

  write(updater: (draft: AppState) => void): void {
    const draft = structuredClone(this.#state);
    updater(draft);
    this.#state = draft;
  }
}

function mergeState(base: AppState, seed?: Partial<AppState>): AppState {
  if (!seed) {
    return base;
  }

  return {
    owners: seed.owners ? structuredClone(seed.owners) : base.owners,
    properties: seed.properties ? structuredClone(seed.properties) : base.properties,
    leases: seed.leases ? structuredClone(seed.leases) : base.leases,
    ledgerEntries: seed.ledgerEntries ? structuredClone(seed.ledgerEntries) : base.ledgerEntries,
    invoices: seed.invoices ? structuredClone(seed.invoices) : base.invoices,
  };
}

