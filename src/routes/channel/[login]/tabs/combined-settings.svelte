<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs';
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { channelSettingDefaults } from './settings';
  import { userSettingDefaults } from './user-settings';
  import Connections from './connections.svelte';
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
  ): Promise<{ ok: boolean; error: string }> => {
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
  ): Promise<{ ok: boolean; error: string }> => {
    const res = await fetchBackend<Record<string, unknown>>('users/me/settings', {
      method: 'PATCH',
      auth: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.errors?.length) return { ok: false, error: res.errors[0].message };
    return { ok: res.statusCode >= 200 && res.statusCode < 300, error: '' };
  };

  onMount(() => {
    loadChannelSettings();
    loadUserSettings();
  });
</script>

<div class="flex justify-center px-4 py-6">
  <div class="w-full max-w-5xl">
    <Tabs.Root value="channel">
      <Tabs.List class="mb-4 w-full justify-start">
        <Tabs.Trigger value="channel">Channel Settings</Tabs.Trigger>
        <Tabs.Trigger value="account">Account Settings</Tabs.Trigger>
        <Tabs.Trigger value="connections">Connections</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="channel">
        <PotatSettings
          title="Channel Settings"
          defaults={channelSettingDefaults}
          loadSettings={loadChannelSettings}
          updateSettings={updateChannelSettings}
        />
      </Tabs.Content>

      <Tabs.Content value="account">
        <PotatSettings
          title="Account Settings"
          defaults={userSettingDefaults}
          loadSettings={loadUserSettings}
          updateSettings={updateUserSettings}
        />
      </Tabs.Content>

      <Tabs.Content value="connections">
        <Connections />
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
