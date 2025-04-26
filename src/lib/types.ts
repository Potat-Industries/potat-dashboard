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