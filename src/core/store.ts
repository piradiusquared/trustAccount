// store.ts

// import { useSyncExternalStore } from 'react';
import type { AppState } from './domain';

type Listener = () => void;

export interface AppStore {
  getSnapshot(): Readonly<AppState>;
  update(updater: (draft: AppState) => void): void;
  subscribe(listener: Listener): () => void;
}

function createEmptyState(): AppState {
  return {
    owners: [],
    properties: [],
    leases: [],
    ledgerEntries: [],
    invoices: [],
  };
}

class InMemoryAppStore implements AppStore {
  private state: AppState;
  private listeners = new Set<Listener>();

  constructor(initial?: Partial<AppState>) {
    this.state = {
      ...createEmptyState(),
      ...structuredClone(initial ?? {}),
    };
  }

  getSnapshot = (): Readonly<AppState> => {
    return this.state;
  };

  update = (updater: (draft: AppState) => void): void => {
    const draft = structuredClone(this.state);

    updater(draft);

    this.state = draft;

    this.emit();
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  private emit = (): void => {
    this.listeners.forEach(l => l());
  };
}

export const store = new InMemoryAppStore();
