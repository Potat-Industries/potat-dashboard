<script lang="ts">
  import PotatSettings from '$lib/components/settings/+settings.svelte';
  import { channelSettingDefaults } from './settings';
  import { onMount } from 'svelte';

  const loadChannelSettings = async (): Promise<Record<string, unknown>> => {
    // mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      prefix: '#',
      color_responses: true,
      permission: 'VIP',
      online_permission: 'MOD',
      no_reply: false,
      silent_errors: false,
      online_silent_errors: false,
      offline_only: true,
      whisper_only: false,
      online_whisper_only: false,
      language: 'English',
      channel_cooldown: null,
      user_cooldown: null,
      force_language: false,
      paj_bot: null,
      allow_bot_emote_tracking: false,
      emote_streak_response: null,
      pyramid_response: null,
      ignore_dropped: false,
    };
  };

  const updateChannelSettings = async (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    _: Record<string, unknown>
  ): Promise<{ ok: boolean, error: string }> => {
    // mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { ok: Math.random() > 0.5, error: '' };
  };

  onMount(() => loadChannelSettings());
</script>

<PotatSettings
  title="Channel Settings"
  defaults={channelSettingDefaults}
  loadSettings={loadChannelSettings}
  updateSettings={updateChannelSettings}
/>