 <script lang="ts">
  import PotatSettings from "$lib/components/settings/+settings.svelte";
  import { onMount } from "svelte";
  import { userSettingDefaults } from "./settings";

  const loadUserSettings = async (): Promise<Record<string, any>> => {
    // mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { 
      language: "English",
      no_reply: true,
      color_responses: false,
      ignore_dropped: true
    };
  }

  const updateUserSettings = async (
    _: Record<string, any>
  ): Promise<{ ok: boolean, error: string }> => {
    // mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { ok: Math.random() > 0.5, error: "" };
  }

  onMount(() => loadUserSettings());
</script>

<PotatSettings 
  title="Global User Settings"
  defaults={userSettingDefaults}
  loadSettings={loadUserSettings}
  updateSettings={updateUserSettings}
/>