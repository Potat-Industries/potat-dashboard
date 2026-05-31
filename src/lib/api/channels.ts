import { fetchBackend } from '$lib/utils';
import { env } from '$env/dynamic/public';
import type { BotCommand, ChannelCommand, CommandSettings } from '$lib/types';

// ── Channel settings ──────────────────────────────────────────────────────────

export const getChannelSettings = async (channelId: string): Promise<Record<string, unknown>> => {
  const res = await fetchBackend<Record<string, unknown>>('channel/settings', {
    auth: true,
    params: { id: channelId },
  });
  if (res.errors?.length || !res.data?.[0]) return {};
  return res.data[0];
};

export const updateChannelSettings = async (
  channelId: string,
  settings: Record<string, unknown>
): Promise<{ ok: boolean; error: string }> => {
  const res = await fetchBackend<Record<string, unknown>>('channels/me/settings', {
    method: 'PATCH',
    auth: true,
    params: { id: channelId },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (res.errors?.length) return { ok: false, error: res.errors[0].message };
  return { ok: res.statusCode >= 200 && res.statusCode < 300, error: '' };
};

// ── Custom commands ───────────────────────────────────────────────────────────

export const getChannelCommands = async (channelId: string): Promise<ChannelCommand[]> => {
  const res = await fetchBackend<ChannelCommand>('channel/commands', {
    auth: true,
    params: { id: channelId },
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return res.data ?? [];
};

export const createChannelCommand = async (
  channelId: string,
  payload: Record<string, unknown>
): Promise<ChannelCommand | null> => {
  const res = await fetchBackend<ChannelCommand>('channel/commands', {
    method: 'POST',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, channel_id: channelId }),
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return res.data?.[0] ?? null;
};

export const updateChannelCommand = async (
  channelId: string,
  commandId: number,
  payload: Record<string, unknown>
): Promise<void> => {
  const res = await fetchBackend<ChannelCommand>('channel/commands', {
    method: 'PATCH',
    auth: true,
    params: { id: channelId, command_id: String(commandId) },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};

export const deleteChannelCommand = async (channelId: string, commandId: number): Promise<void> => {
  const res = await fetchBackend('channel/commands', {
    method: 'DELETE',
    auth: true,
    params: { id: channelId, command_id: String(commandId) },
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};

// ── Bot commands & overrides ──────────────────────────────────────────────────

export const getBotCommands = async (): Promise<BotCommand[]> => {
  const apiBase = env.PUBLIC_API_BASE_URL ?? 'https://api.potat.app';
  const res = await fetch(`${apiBase}/help`);
  if (!res.ok) throw new Error(`Failed to fetch bot commands: ${res.status}`);
  return res.json() as Promise<BotCommand[]>;
};

export const getCommandSettings = async (channelId: string): Promise<CommandSettings[]> => {
  const res = await fetchBackend<CommandSettings>('channel/command-settings', {
    auth: true,
    params: { id: channelId },
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return res.data ?? [];
};

export const updateCommandSettings = async (settings: CommandSettings): Promise<void> => {
  const res = await fetchBackend<CommandSettings>('channel/command-settings', {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};

export const deleteCommandSettings = async (channelId: string, command: string): Promise<void> => {
  const res = await fetchBackend('channel/command-settings', {
    method: 'DELETE',
    auth: true,
    params: { id: channelId, command },
  });
  if (res.errors?.length) throw new Error(res.errors[0].message);
};
