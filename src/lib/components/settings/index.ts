import type langauges from "$lib/langauges";

export type UserRequires =
| 'NONE'
| 'SUBSCRIBER'
| 'VIP'
| 'MOD'
| 'AMBASSADOR'
| 'BROADCASTER';

export interface ChannelSettings {
  prefix: string;
  color_responses: boolean;
  permission: UserRequires;
  online_permission?: UserRequires;
  no_reply: boolean;
  silent_errors: boolean;
  online_silent_errors?: boolean;
  offline_only: boolean;
  whisper_only: boolean;
  online_whisper_only?: boolean;
  language: (typeof langauges)[number];
  channel_cooldown: number | null;
  user_cooldown: number | null;
  force_language: boolean;
  paj_bot: string | null;
  allow_bot_emote_tracking?: boolean;
  emote_streak_response?: string | null;
  pyramid_response?: string | null;
  ignore_dropped: boolean;
}

export type SettingTypes = 'boolean' | 'choice' | 'number' | 'text';

export interface UserSettings {
  language: string;
  no_reply: boolean;
  color_responses: boolean;
  ignore_dropped: boolean;
}

export interface Setting {
  id: keyof ChannelSettings | keyof UserSettings
  value: boolean | string | number | null;
  description: string;
  possibleValues?: string[];
  defaults?: string[];
  type: SettingTypes;
}

