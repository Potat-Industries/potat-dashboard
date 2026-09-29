export enum Platforms {
  TWITCH = 'TWITCH',
  DISCORD = 'DISCORD',
  SPOTIFY = 'SPOTIFY',
  LASTFM = 'LASTFM',
  KICK = 'KICK',
  YOUTUBE = 'YOUTUBE',
  STV = 'STV',
  BTTV = 'BTTV',
  FFZ = 'FFZ',
  ANILIST = 'ANILIST',
  MAL = 'MAL',
  MONKEY_TYPE = 'MONKEYTYPE',
  STEAM = 'STEAM'
}

export type EmoteProviders =
  | Platforms.BTTV
  | Platforms.FFZ
  | Platforms.STV
  | Platforms.TWITCH
  | Platforms.KICK
  | Platforms.DISCORD
  | 'EMOJI';

export interface EmoteMetricUse {
  readonly emote_id: string;
  readonly emote_name: string;
  readonly emote_alias?: string;
  readonly provider: EmoteProviders;
  readonly count: string;
  readonly url: string;
}

export interface ChannelCommand {
  command_id: number;
  channel_id: string;
  trigger: string;
  response: string;
  platform: string;
  cooldown: number;
  delay: number;
  use_count: number;
  user_id: number;
  user_trigger_ids: string[];
  user_ignore_ids: string[];
  reply: boolean;
  whisper: boolean;
  announce: boolean;
  created: string;
  modified: string;
  help?: string;
  name?: string;
  run_command?: string;
}

export interface CommandSettings {
  channel_id: string;
  command: string;
  permission?: string;
  users_blacklisted?: string[];
  users_whitelisted?: string[];
  custom_cooldown?: number;
  channel_usage: number;
  is_enabled: boolean;
  offline_only?: boolean;
  silent_errors: boolean;
  allow_bots?: boolean;
  platform: string;
  ambassador_granted: boolean;
}

export interface BotCommand {
  name: string;
  title: string;
  description: string;
  detailedDescription?: string;
  usage: string;
  category: string;
  cooldown: number;
  level: number;
  userRequires: string;
  botRequires: string;
  aliases: string[];
  conditions: {
    ryan?: boolean;
    offlineOnly?: boolean;
    whisperable?: boolean;
    ignoreBots?: boolean;
    isBlockable?: boolean;
    isNotPipable?: boolean;
  };
  flags: {
    name: string;
    type: string;
    description: string;
    level: number;
    required: boolean;
    aliases?: string[];
    usage?: string;
    multi?: boolean;
    user_requires?: string;
  }[];
}