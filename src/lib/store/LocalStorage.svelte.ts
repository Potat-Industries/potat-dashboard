import { writable } from 'svelte/store';

export interface UserState {
  id: string;
  login: string;
  name: string;
  stv_id: string;
  is_channel: boolean;
}

export const Storage = {
  UserState: 'userState',
  Token: 'authorization',
} as const;

function createLocalStorageStore<T>(key: string, initialValue: T) {
	let parsedValue: T | null = null;
	if (typeof localStorage !== 'undefined') {
		try {
			parsedValue = JSON.parse(localStorage.getItem(key) as string) as T;
		} catch {
			// fortnite
		}
	} else {
		parsedValue = initialValue;
	}

  const store = writable(parsedValue);

  store.subscribe(($store) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify($store));
    }
  });

  return store;
}

export const userState = createLocalStorageStore<UserState | null>(Storage.UserState, null);
export const userToken = createLocalStorageStore<string | null>(Storage.Token, null);
