import type { Setting } from "$lib/components/settings";
import langauges from "$lib/langauges";

export const channelSettingDefaults: Setting[] = [
  {
    id: 'prefix',
    value: '#',
    type: 'text',
    description: 'The prefix to use for commands',
  },
  {
    id: 'color_responses',
    value: true,
    type: 'boolean',
    description: 'If enabled, the bot will respond using /me responses.',
  },
  {
    id: 'permission',
    value: 'NONE',
    type: 'choice',
    description: 'The required permission level to use commands in the channel.',
    possibleValues: [
      'NONE',
      'SUBSCRIBER',
      'VIP',
      'MOD',
      'AMBASSADOR',
      'BROADCASTER',
    ],
  },
  {
    id: 'online_permission',
    value: 'NONE',
    type: 'choice',
    description: 'The required permission level to use commands in the channel while it is live.',
    possibleValues: [
      'NONE',
      'SUBSCRIBER',
      'VIP',
      'MOD',
      'AMBASSADOR',
      'BROADCASTER',
    ],
  },
  {
    id: 'no_reply',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot won\'t mention you or reply in responses.',
  },
  {
    id: 'silent_errors',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will not reply with permission errors when the channel is live.',
  },
  {
    id: 'online_silent_errors',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will not reply with permission errors when the channel is live.',
  },
  {
    id: 'offline_only',
    value: true,
    type: 'boolean',
    description: 'If enabled, the bot will only respond to commands when the channel is offline.',
  },
  {
    id: 'whisper_only',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will only respond to commands via whispers.',
  },
  {
    id: 'online_whisper_only',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will only respond to commands via whispers when the channel is live.',
  },
  {
    id: 'language',
    value: 'English',
    type: 'choice',
    description: 'The language the bot will use to communicate with users in your channel.',
    possibleValues: langauges,
    defaults: ["English", "Portuguese", "Spanish", "German"],
  },
  {
    id: 'force_language',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will only respond in the selected channel language, overriding their user specified language.',
  },
  {
    id: 'channel_cooldown',
    value: null,
    type: 'number',
    description: 'The cooldown in seconds between commands in the channel.',
  },
  {
    id: 'user_cooldown',
    value: null,
    type: 'number',
    description: 'The cooldown in seconds between commands for each user.',
  },
  {
    id: 'paj_bot',
    value: null,
    type: 'text',
    description: 'The URL for pajbot banphrases.',
  },
  {
    id: 'allow_bot_emote_tracking',
    value: false,
    type: 'boolean',
    description: 'If enabled, chatbots using emotes will be tracked for emote usage/statistics.',
  },
  {
    id: 'emote_streak_response',
    value: null,
    type: 'text',
    description: 'The response to give when a user ends a streak of emotes.',
  },
  {
    id: 'pyramid_response',
    value: null,
    type: 'text',
    description: 'The response to give when a user successfully finishes a pyramid of emotes.',
  },
  {
    id: 'ignore_dropped',
    value: false,
    type: 'boolean',
    description: 'If enabled, the bot will not try a fallback whisper to anyone in the channel when a messsage fails to send.',
  }
];