import { writable } from 'svelte/store';
import { browser } from '$app/environment'

interface User {
  id: string;
  login: string;
  name: string;
  stv_id: string;
  is_channel: boolean;
}

let storedUserData: string | null = null;
if (browser) {
  storedUserData = localStorage.getItem('userState');
}

export const userStore = writable<User | null>(storedUserData ? JSON.parse(storedUserData) : null);

userStore.subscribe(($userStore) => {
  if ($userStore && browser) {
    localStorage.setItem('userState', JSON.stringify($userStore));
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'userState' && browser) {
      const newData = localStorage.getItem('userState');
      if (newData) {
        userStore.set(JSON.parse(newData));
      }
    }
  });
}
