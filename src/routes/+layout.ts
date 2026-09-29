import { browser } from '$app/environment';

export interface ChannelPartial {
  readonly channel_id: string;
  readonly username: string;
}

export const load = async (): Promise<{ channels: ChannelPartial[] }> => {
  const channels = await globalThis.fetch('https://api.potat.app/channels', {
    headers: browser ? {} : { Origin: 'https://potat.app' },
  })
    .then(res => res.json())
    .then(res => res?.data ?? [] as ChannelPartial[]);

  return { channels };
};
