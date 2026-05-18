import type { TabConfig } from '$lib/components/tabs/index';
import Settings2 from 'lucide-svelte/icons/settings-2';
import History from 'lucide-svelte/icons/history';
import BarChart2 from 'lucide-svelte/icons/bar-chart-2';
import Terminal from 'lucide-svelte/icons/terminal';
import Shield from 'lucide-svelte/icons/shield';
import Bell from 'lucide-svelte/icons/bell';
import Commands from './tabs/commands.svelte';
import ModActions from './tabs/mod-actions.svelte';
import EmoteActions from './tabs/emote-history.svelte';
import EmoteStats from './tabs/emote-stats.svelte';
import Reminders from './tabs/reminders.svelte';
import CombinedSettings from './tabs/combined-settings.svelte';

export const tabs: TabConfig[] = [
  {
    id: 'emote-actions',
    label: 'Emote Actions',
    icon: History,
    component: EmoteActions,
  },
  {
    id: 'emote-stats',
    label: 'Emote Stats',
    icon: BarChart2,
    component: EmoteStats,
  },
  {
    id: 'commands',
    label: 'Commands',
    icon: Terminal,
    ownerOnly: true,
    component: Commands,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings2,
    ownerOnly: true,
    component: CombinedSettings,
  },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: Bell,
    ownerOnly: true,
    component: Reminders,
  },
  {
    id: 'mod-actions',
    label: 'Mod Actions',
    icon: Shield,
    ownerOnly: true,
    component: ModActions,
  },
];
