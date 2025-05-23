import type { TabConfig } from '$lib/components/tabs/index';
import Settings2 from 'lucide-svelte/icons/settings-2';
import Settings from './tabs/settings.svelte';
import CustomCommands from './tabs/custom-commands.svelte';
import ModActions from './tabs/mod-actions.svelte';
import EmoteActions from './tabs/emote-history.svelte';
import EmoteStats from './tabs/emote-stats.svelte';

export const tabs: TabConfig[] = [
  {
    id: 'emote-actions',
    label: 'Emote Actions',
    icon: Settings2,
    component: EmoteActions,
  },
  {
    id: 'emote-stats',
    label: 'Emote Stats',
    icon: Settings2,
    component: EmoteStats,
  },
  {
    id: 'custom-commands',
    label: 'Custom Commands',
    icon: Settings2,
    component: CustomCommands,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    component: Settings,
  },
  {
    id: 'mod-actions',
    label: 'Mod Actions',
    icon: Settings2,
    component: ModActions,
  },
];