// hooks.ts

import { useSyncExternalStore } from 'react';
import { store } from './store';
import type { AppState } from './domain';

export function useAppSelector<T>(
  selector: (state: AppState) => T,
): T {
  return useSyncExternalStore(
    store.subscribe.bind(store),
    () => selector(store.getSnapshot()),
  );
}