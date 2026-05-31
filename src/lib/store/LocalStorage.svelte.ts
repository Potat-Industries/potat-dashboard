import { writable } from 'svelte/store';

export interface UserState {
  id: string;
  login: string;
  name: string;
  stv_id: string;
  is_channel: boolean;
  pfp?: string;
}

export const Storage = {
  UserState: 'userState',
} as const;

function createLocalStorageStore<T>(key: string, initialValue: T) {
  let parsedValue: T | null = initialValue;

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        parsedValue = JSON.parse(raw) as T;
      }
    } catch {
      // fortnite
    }

    // Clean up tokens written by older versions of the app.
    try {
      localStorage.removeItem('authorization');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('authorization');
      }
    } catch {
      // ignore
    }
  }

  const store = writable<T | null>(parsedValue);

  store.subscribe(($store) => {
    if (typeof localStorage === 'undefined') return;
    if ($store === null || $store === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify($store));
    }
  });

  return store;
}

export const userState = createLocalStorageStore<UserState | null>(Storage.UserState, null);

