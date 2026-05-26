import { fetchBackend } from '$lib/utils';
import { env } from '$env/dynamic/public';

export interface UserConnection {
  platform: string;
  username: string;
  id: string;
}

export interface Reminder {
  reminder_id: number;
  message: string;
  recipient: string;
  channel: string;
  dateSet: string;
  dateReady: string;
}

// ── User settings ─────────────────────────────────────────────────────────────

export const getUserSettings = async (): Promise<Record<string, unknown>> => {
  try {
    const res = await fetchBackend<Record<string, unknown>>('user/settings', { auth: true });
    if (res.errors?.length || !res.data?.[0]) return {};
    return res.data[0];
  } catch {
    return {};
  }
};

export const updateUserSettings = async (
  settings: Record<string, unknown>,
): Promise<{ ok: boolean; error: string }> => {
  const res = await fetchBackend<Record<string, unknown>>('users/me/settings', {
    method: 'PATCH',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (res.errors?.length) return { ok: false, error: res.errors[0].message };
  return { ok: res.statusCode >= 200 && res.statusCode < 300, error: '' };
};

// ── Reminders ─────────────────────────────────────────────────────────────────

export const getReminders = async (): Promise<Reminder[]> => {
  const res = await fetchBackend<Reminder>('user/reminders', { auth: true });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return (res.data ?? []).sort(
    (a, b) => new Date(a.dateReady).getTime() - new Date(b.dateReady).getTime(),
  );
};

export const deleteReminder = async (id: number): Promise<void> => {
  const res = await fetchBackend(`user/reminders/${id}`, {
    method: 'DELETE',
    auth: true,
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};

// ── Connections & auth ────────────────────────────────────────────────────────

export const getUserConnections = async (login: string): Promise<UserConnection[]> => {
  const res = await fetchBackend<{ user: { connections: UserConnection[] } }>(`users/${login}`, {
    auth: true,
  });
  return res.data?.[0]?.user?.connections ?? [];
};

export const getAuthUrl = async (platform: string): Promise<string> => {
  const lower = platform.toLowerCase();

  // FFZ returns a direct redirect URL rather than a JSON payload
  if (lower === 'ffz') {
    const apiBase = env.PUBLIC_API_BASE_URL ?? 'https://api.potat.app';
    return `${apiBase}/auth/ffz/authorize`;
  }

  const res = await fetchBackend<string>(`auth/${lower}/authorize`, { auth: true });
  if (res.errors?.length || !res.data?.[0]) {
    throw new Error(`Failed to get authorization URL for ${platform}`);
  }
  return res.data[0];
};

export const disconnectPlatform = async (platform: string): Promise<void> => {
  const res = await fetchBackend(`auth/${platform.toLowerCase()}/disconnect`, {
    method: 'DELETE',
    auth: true,
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};
