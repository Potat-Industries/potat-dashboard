<script lang="ts">
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { channelSettingDefaults } from './settings';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import { getChannelSettings, updateChannelSettings } from '$lib/api/channels';

  const loadSettings = () => {
    const id = $userState?.id;
    if (!id) return Promise.resolve({});
    return getChannelSettings(id);
  };

  const updateSettings = (s: Record<string, unknown>) => {
    const id = $userState?.id;
    if (!id) return Promise.resolve({ ok: false, error: 'Not logged in' });
    return updateChannelSettings(id, s);
  };

</script>

<PotatSettings
  title="Channel Settings"
  defaults={channelSettingDefaults}
  loadSettings={loadSettings}
  updateSettings={updateSettings}
/>