export interface ChannelPartial {
  readonly channel_id: string;
  readonly username: string;
}

export const load = async (): Promise<{ channels: ChannelPartial[] }> => {
  const channels = await fetch('https://api.potat.app/channels')
    .then(res => res.json())
    .then(res => res?.data ?? [] as ChannelPartial[]);

  return { channels }
};