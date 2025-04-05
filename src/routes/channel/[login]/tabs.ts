import type { TabConfig } from '$lib/components/tabs/index';
import Settings2 from 'lucide-svelte/icons/settings-2';
import Settings from './tabs/settings.svelte';
import CustomCommands from './tabs/custom-commands.svelte';
import ModActions from './tabs/mod-actions.svelte';

export const tabs: TabConfig[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    component: Settings,
  },
  {
    id: 'custom-commands',
    label: 'Custom Commands',
    icon: Settings2,
    component: CustomCommands,
  },
  {
    id: 'mod-actions',
    label: 'Mod Actions',
    icon: Settings2,
    component: ModActions,
  },
];