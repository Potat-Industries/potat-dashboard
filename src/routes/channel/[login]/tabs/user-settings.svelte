 <script lang="ts">
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { onMount } from 'svelte';
  import { userSettingDefaults } from './user-settings';
  import { fetchBackend } from '$lib/utils';

  const loadUserSettings = async (): Promise<Record<string, unknown>> => {
    try {
      const res = await fetchBackend<Record<string, unknown>>('user/settings', { auth: true });
      if (res.errors?.length || !res.data?.[0]) return {};
      return res.data[0];
    } catch {
      return {};
    }
  };

  const updateUserSettings = async (
    settings: Record<string, unknown>
  ): Promise<{ ok: boolean, error: string }> => {
    const res = await fetchBackend<Record<string, unknown>>('users/me/settings', {
      method: 'PATCH',
      auth: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.errors?.length) return { ok: false, error: res.errors[0].message };
    return { ok: res.statusCode >= 200 && res.statusCode < 300, error: '' };
  };

  onMount(() => loadUserSettings());
</script>

<PotatSettings
  title="Global User Settings"
  defaults={userSettingDefaults}
  loadSettings={loadUserSettings}
  updateSettings={updateUserSettings}
/>