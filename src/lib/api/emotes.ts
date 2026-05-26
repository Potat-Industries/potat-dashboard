import { fetchBackend } from '$lib/utils';
import type { EmoteMetricUse } from '$lib/types';

export interface SimpleChannel {
  pfp: string;
  bestName: string;
  login: string;
  name: string;
}

export interface EmoteHistoryEntry {
  readonly set_id: string;
  readonly provider: string;
  readonly action: string;
  readonly emote_id: string;
  readonly emote_name: string;
  readonly emote_alias: string;
  readonly emote_new_alias: null;
  readonly actor: 'potatbotat' | 'external';
  readonly user_login: string;
  readonly user_name: string;
  readonly user_ffz_id: string;
  readonly user_bttv_id: string;
  readonly user_stv_id: string;
  readonly known_bot: boolean;
  readonly bestUserName: string;
  readonly set_name: string;
  readonly user_color: string;
  readonly ago: string;
  readonly user_stv_pfp: string;
  readonly user_pfp: string;
  readonly emoteURL: string;
  readonly emoteLink: string;
  readonly expires_at: string | null;
  readonly is_expired: boolean;
  readonly type: string;
}

interface EmoteHistoryResponse {
  channel: SimpleChannel;
  history: EmoteHistoryEntry[];
}

// ── Emote stats ───────────────────────────────────────────────────────────────

export const getEmoteStats = async (params: {
  login: string;
  order: string;
  period: string;
  provider: string;
  after?: string | null;
}): Promise<{ data: EmoteMetricUse[]; cursor: string | null }> => {
  const res = await fetchBackend<EmoteMetricUse>('emotes/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    params: { ...params },
  });
  return {
    data: res.data ?? [],
    cursor: res.pagination?.hasNextPage ? (res.pagination.cursor ?? null) : null,
  };
};

// ── Emote history ─────────────────────────────────────────────────────────────

export const getEmoteHistory = async (
  login: string,
  params: { limit?: number; after?: string | null },
): Promise<{
  channel: SimpleChannel | null;
  history: EmoteHistoryEntry[];
  cursor: string | null;
}> => {
  const res = await fetchBackend<EmoteHistoryResponse>(`emotes/history/${login}`, {
    params: { limit: params.limit ?? 50, after: params.after },
  });
  const data = res.data[0];
  return {
    channel: data?.channel ?? null,
    history: data?.history ?? [],
    cursor: res.pagination?.hasNextPage ? (res.pagination.cursor ?? null) : null,
  };
};
