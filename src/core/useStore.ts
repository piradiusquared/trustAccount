// useStore.ts
import { useSyncExternalStore } from "react";
import { createStore } from "./store";

const store = createStore();

export function useOwners() {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().owners
  );
}

export function addOwner(firstName: string, surname?: string, email?: string) {
  store.addOwner({
    id: crypto.randomUUID(),
    firstName,
    surname,
    email,
  });
}