 <script lang="ts">
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { userSettingDefaults } from './settings';
  import { getUserSettings, updateUserSettings } from '$lib/api/users';
</script>

<PotatSettings
  title="Global User Settings"
  defaults={userSettingDefaults}
  loadSettings={getUserSettings}
  updateSettings={updateUserSettings}
/>