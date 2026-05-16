<script lang="ts">
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { channelSettingDefaults } from './settings';
  import { onMount } from 'svelte';
  import { fetchBackend } from '$lib/utils';
  import { userState } from '$lib/store/LocalStorage.svelte';

  const loadChannelSettings = async (): Promise<Record<string, unknown>> => {
    const id = $userState?.id;
    if (!id) return {};
    try {
      const res = await fetchBackend<Record<string, unknown>>('channel/settings', {
        auth: true,
        params: { id },
      });
      if (res.errors?.length || !res.data?.[0]) return {};
      return res.data[0];
    } catch {
      return {};
    }
  };

  const updateChannelSettings = async (
    settings: Record<string, unknown>
  ): Promise<{ ok: boolean, error: string }> => {
    const id = $userState?.id;
    if (!id) return { ok: false, error: 'Not logged in' };
    const res = await fetchBackend<Record<string, unknown>>('channels/me/settings', {
      method: 'PATCH',
      auth: true,
      params: { id },
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.errors?.length) return { ok: false, error: res.errors[0].message };
    return { ok: res.statusCode >= 200 && res.statusCode < 300, error: '' };
  };

  onMount(() => loadChannelSettings());
</script>

<PotatSettings
  title="Channel Settings"
  defaults={channelSettingDefaults}
  loadSettings={loadChannelSettings}
  updateSettings={updateChannelSettings}
/>