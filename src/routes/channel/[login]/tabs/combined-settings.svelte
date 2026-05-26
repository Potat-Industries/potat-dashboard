<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs';
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { channelSettingDefaults } from './settings';
  import { userSettingDefaults } from './user-settings';
  import Connections from './connections.svelte';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import { getChannelSettings, updateChannelSettings } from '$lib/api/channels';
  import { getUserSettings, updateUserSettings } from '$lib/api/users';

  const loadChannelSettings = () => {
    const id = $userState?.id;
    if (!id) return Promise.resolve({});
    return getChannelSettings(id);
  };

  const saveChannelSettings = (s: Record<string, unknown>) => {
    const id = $userState?.id;
    if (!id) return Promise.resolve({ ok: false, error: 'Not logged in' });
    return updateChannelSettings(id, s);
  };
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
          updateSettings={saveChannelSettings}
        />
      </Tabs.Content>

      <Tabs.Content value="account">
        <PotatSettings
          title="Account Settings"
          defaults={userSettingDefaults}
          loadSettings={getUserSettings}
          updateSettings={updateUserSettings}
        />
      </Tabs.Content>

      <Tabs.Content value="connections">
        <Connections />
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
