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
  storedUserData = localStorage.getItem('userData');
}

export const userStore = writable<User | null>(storedUserData ? JSON.parse(storedUserData) : null);

userStore.subscribe(($userStore) => {
  if ($userStore && browser) {
    localStorage.setItem('userData', JSON.stringify($userStore));
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'userData' && browser) {
      const newData = localStorage.getItem('userData');
      if (newData) {
        userStore.set(JSON.parse(newData));
      }
    }
  });
}
