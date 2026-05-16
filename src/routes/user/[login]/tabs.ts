import type { TabConfig } from '$lib/components/tabs/index';
import Settings2 from 'lucide-svelte/icons/settings-2';
import Bell from 'lucide-svelte/icons/bell';
import Link from 'lucide-svelte/icons/link';
import Reminders from './tabs/reminders.svelte';
import Settings from './tabs/settings.svelte';
import Connections from './tabs/connections.svelte';
// import Book from "lucide-svelte/icons/book";
// import UserStats from "./tabs/userStats.svelte";

export const tabs: TabConfig[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    ownerOnly: true,
    component: Settings,
  },
  // { todo
  //   id: 'stats',
  //   label: 'Stats',
  //   icon: Book,
  //   component: UserStats
  // },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: Bell,
    ownerOnly: true,
    component: Reminders,
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: Link,
    ownerOnly: true,
    component: Connections,
  },
];