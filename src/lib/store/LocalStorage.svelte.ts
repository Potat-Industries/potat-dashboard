import { tick } from 'svelte';

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

/**
 * Source: https://github.com/Rich-Harris/local-storage-test/blob/main/src/lib/storage.svelte.ts
 */
export class LocalStorage<T> {
	#key: string;
	#listeners = 0;
	#value: T | undefined;

	#handler = (e: StorageEvent) => {
		if (e.storageArea !== localStorage) {
      return;
    }
		if (e.key !== this.#key) {
      return;
    }
	};

	constructor(key: string, initial?: T) {
		this.#key = key;
		this.#value = initial;

		if (typeof localStorage !== 'undefined') {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(initial));
			}
		}
	}

	get current(): T {
		const root =
			typeof localStorage !== 'undefined'
				? JSON.parse(localStorage.getItem(this.#key) as string) as T
				: this.#value;

		const proxies = new WeakMap();

		const proxy = (value: unknown) => {
			if (typeof value !== 'object' || value === null) {
				return value;
			}

			let p = proxies.get(value);

			if (!p) {
				p = new Proxy(value, {
					get: (target, property) => {
						return proxy(Reflect.get(target, property));
					},
					set: (target, property, value) => {
						Reflect.set(target, property, value);

						if (typeof localStorage !== 'undefined') {
							localStorage.setItem(this.#key, JSON.stringify(root));
						}

						return true;
					}
				});

				proxies.set(value, p);
			}

			return p;
		};

		$effect.root(() => {
			if ($effect.tracking()) {
				$effect(() => {
					if (this.#listeners === 0) {
						window.addEventListener('storage', this.#handler);
					}
	
					this.#listeners += 1;
	
					return () => {
						tick().then(() => {
							this.#listeners -= 1;
							if (this.#listeners === 0) {
								window.removeEventListener('storage', this.#handler);
							}
						});
					};
				});
			}
		});

		return proxy(root);
	}

	set current(value) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(this.#key, JSON.stringify(value));
		}
	}
}

export const userState = new LocalStorage<UserState | null>(Storage.UserState, null);
export const userToken = new LocalStorage<string | null>(Storage.Token, null);