<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '$lib/components/ui/dialog/index.js';
  import { fetchBackend } from '$lib/utils';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import type { CommandSettings } from '$lib/types';

  type PermissionLevel = 'NONE' | 'SUBSCRIBER' | 'VIP' | 'MOD' | 'AMBASSADOR' | 'BROADCASTER';

  type OverrideForm = {
    command: string;
    is_enabled: boolean;
    permission: PermissionLevel | null;
    custom_cooldown: number | null;
    silent_errors: boolean;
    offline_only: boolean | null;
    allow_bots: boolean | null;
    ambassador_granted: boolean;
  };

  const permissionLevels: { value: PermissionLevel; label: string }[] = [
    { value: 'NONE',        label: 'None (everyone)' },
    { value: 'SUBSCRIBER',  label: 'Subscriber' },
    { value: 'VIP',         label: 'VIP' },
    { value: 'MOD',         label: 'Moderator' },
    { value: 'AMBASSADOR',  label: 'Ambassador' },
    { value: 'BROADCASTER', label: 'Broadcaster' },
  ];

  const emptyForm = (): OverrideForm => ({
    command: '',
    is_enabled: true,
    permission: null,
    custom_cooldown: null,
    silent_errors: false,
    offline_only: null,
    allow_bots: null,
    ambassador_granted: false,
  });

  let overrides: CommandSettings[] = $state([]);
  let isLoading = $state(false);
  let dialogOpen = $state(false);
  let editingCommand = $state<string | null>(null);
  let savingForm = $state(false);
  let resettingCommand = $state<string | null>(null);
  let form = $state<OverrideForm>(emptyForm());
  let search = $state('');

  const channelId = $derived($userState?.id ?? '');

  const filteredOverrides = $derived(
    search.trim()
      ? overrides.filter(o => o.command.toLowerCase().includes(search.toLowerCase()))
      : overrides
  );

  const load = async () => {
    if (!channelId) return;
    isLoading = true;
    try {
      const res = await fetchBackend<CommandSettings>('channel/command-settings', {
        auth: true,
        params: { id: channelId },
      });
      if (res.errors?.length) {
        toast.error('Failed to load command overrides', {
          description: res.errors[0].message,
          duration: 4000,
        });
      } else {
        overrides = res.data ?? [];
      }
    } finally {
      isLoading = false;
    }
  };

  const openCreate = () => {
    editingCommand = null;
    form = emptyForm();
    dialogOpen = true;
  };

  const openEdit = (override: CommandSettings) => {
    editingCommand = override.command;
    form = {
      command: override.command,
      is_enabled: override.is_enabled,
      permission: (override.permission as PermissionLevel) ?? null,
      custom_cooldown: override.custom_cooldown ?? null,
      silent_errors: override.silent_errors,
      offline_only: override.offline_only ?? null,
      allow_bots: override.allow_bots ?? null,
      ambassador_granted: override.ambassador_granted,
    };
    dialogOpen = true;
  };

  const saveOverride = async () => {
    if (!form.command.trim()) {
      toast.error('Command name is required.');
      return;
    }
    savingForm = true;
    const payload: CommandSettings = {
      channel_id: channelId,
      command: form.command.trim().toLowerCase(),
      is_enabled: form.is_enabled,
      silent_errors: form.silent_errors,
      ambassador_granted: form.ambassador_granted,
      channel_usage: 0,
      platform: 'TWITCH',
      ...(form.permission !== null && { permission: form.permission }),
      ...(form.custom_cooldown !== null && { custom_cooldown: form.custom_cooldown }),
      ...(form.offline_only !== null && { offline_only: form.offline_only }),
      ...(form.allow_bots !== null && { allow_bots: form.allow_bots }),
    };
    try {
      const res = await fetchBackend<CommandSettings>('channel/command-settings', {
        method: 'PUT',
        auth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.errors?.length) {
        toast.error('Failed to save override', {
          description: res.errors[0].message,
          duration: 4000,
        });
        return;
      }
      if (editingCommand !== null) {
        overrides = overrides.map(o => o.command === editingCommand ? payload : o);
        toast.success(`Override for "${payload.command}" updated`, { duration: 2000 });
      } else {
        overrides = [...overrides, payload];
        toast.success(`Override for "${payload.command}" created`, { duration: 2000 });
      }
      dialogOpen = false;
    } finally {
      savingForm = false;
    }
  };

  const resetOverride = async (override: CommandSettings) => {
    resettingCommand = override.command;
    try {
      const res = await fetchBackend('channel/command-settings', {
        method: 'DELETE',
        auth: true,
        params: { id: channelId, command: override.command },
      });
      if (res.errors?.length) {
        toast.error('Failed to reset override', {
          description: res.errors[0].message,
          duration: 4000,
        });
        return;
      }
      overrides = overrides.filter(o => o.command !== override.command);
      toast.success(`"${override.command}" reset to defaults`, { duration: 2000 });
    } finally {
      resettingCommand = null;
    }
  };

  onMount(load);
</script>

<Dialog bind:open={dialogOpen}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>{editingCommand !== null ? `Edit "${editingCommand}"` : 'New Command Override'}</DialogTitle>
      <DialogDescription>
        Override settings for a built-in bot command in this channel.
        Leave optional fields unset to inherit the channel defaults.
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-2">
      <div class="grid gap-1.5">
        <Label for="command">Command name <span class="text-destructive">*</span></Label>
        <Input
          id="command"
          bind:value={form.command}
          placeholder="e.g. potato"
          disabled={editingCommand !== null}
          class="font-mono"
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Enabled</p>
          <p class="text-xs text-muted-foreground">Allow the command to be used in this channel</p>
        </div>
        <Switch bind:checked={form.is_enabled} />
      </div>

      <div class="grid gap-1.5">
        <Label>Permission override <span class="text-muted-foreground text-xs">(optional)</span></Label>
        <Select.Root
          selected={form.permission ? { value: form.permission, label: permissionLevels.find(p => p.value === form.permission)?.label } : undefined}
          onSelectedChange={(s) => { form.permission = s ? (s.value as PermissionLevel) : null; }}
        >
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Inherit from channel settings" />
          </Select.Trigger>
          <Select.Content class="w-[var(--radix-select-trigger-width)] border rounded-md shadow-lg">
            {#each permissionLevels as level}
              <Select.Item value={level.value}>{level.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="grid gap-1.5">
        <Label for="cooldown">Custom cooldown (seconds) <span class="text-muted-foreground text-xs">(optional)</span></Label>
        <Input
          id="cooldown"
          type="number"
          min={0}
          max={3600}
          placeholder="Inherit from channel settings"
          value={form.custom_cooldown ?? ''}
          oninput={(e) => {
            const v = (e.currentTarget as HTMLInputElement).value;
            form.custom_cooldown = v === '' ? null : Number(v);
          }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Silent errors</p>
          <p class="text-xs text-muted-foreground">Suppress permission error messages</p>
        </div>
        <Switch bind:checked={form.silent_errors} />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Offline only</p>
          <p class="text-xs text-muted-foreground">Only allow the command when the channel is offline</p>
        </div>
        <Switch
          checked={form.offline_only ?? false}
          onCheckedChange={(v) => { form.offline_only = v; }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Allow bots</p>
          <p class="text-xs text-muted-foreground">Let bots trigger this command</p>
        </div>
        <Switch
          checked={form.allow_bots ?? false}
          onCheckedChange={(v) => { form.allow_bots = v; }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Ambassador granted</p>
          <p class="text-xs text-muted-foreground">Ambassadors can use this command regardless of permission level</p>
        </div>
        <Switch bind:checked={form.ambassador_granted} />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
      <Button disabled={savingForm} onclick={saveOverride}>
        {savingForm ? 'Saving…' : editingCommand !== null ? 'Save Changes' : 'Create Override'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<div class="flex justify-center">
  <fieldset class="w-full max-w-5xl rounded-lg border p-6">
    <legend class="px-2 text-lg font-semibold">Command Overrides</legend>
    <div class="flex justify-between items-center mb-4 gap-2">
      <Input
        placeholder="Search commands…"
        bind:value={search}
        class="max-w-xs"
      />
      <Button onclick={openCreate} size="sm">+ New Override</Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Command</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Permission</TableHead>
          <TableHead>Cooldown</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if isLoading}
          <TableRow>
            <TableCell colspan={6} class="text-center py-8 text-muted-foreground">Loading overrides…</TableCell>
          </TableRow>
        {:else if filteredOverrides.length === 0}
          <TableRow>
            <TableCell colspan={6} class="text-muted-foreground text-center py-8">
              {#if search}
                No overrides match "<strong>{search}</strong>".
              {:else}
                No command overrides yet. Click <strong>+ New Override</strong> to configure a built-in command.
              {/if}
            </TableCell>
          </TableRow>
        {:else}
          {#each filteredOverrides as override (override.command)}
            <TableRow>
              <TableCell class="font-mono text-sm text-primary">{override.command}</TableCell>
              <TableCell>
                {#if override.is_enabled}
                  <Badge variant="outline" class="text-xs text-green-500 border-green-500">enabled</Badge>
                {:else}
                  <Badge variant="outline" class="text-xs text-destructive border-destructive">disabled</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {override.permission ?? '—'}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {override.custom_cooldown != null ? `${override.custom_cooldown}s` : '—'}
              </TableCell>
              <TableCell class="flex gap-1 flex-wrap">
                {#if override.silent_errors}<Badge variant="outline" class="text-xs">silent</Badge>{/if}
                {#if override.offline_only}<Badge variant="outline" class="text-xs">offline only</Badge>{/if}
                {#if override.allow_bots}<Badge variant="outline" class="text-xs">allow bots</Badge>{/if}
                {#if override.ambassador_granted}<Badge variant="outline" class="text-xs">ambassador</Badge>{/if}
                {#if !override.silent_errors && !override.offline_only && !override.allow_bots && !override.ambassador_granted}
                  <span class="text-muted-foreground text-xs">—</span>
                {/if}
              </TableCell>
              <TableCell class="flex gap-2">
                <Button variant="outline" size="sm" onclick={() => openEdit(override)}>Edit</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={resettingCommand === override.command}
                  onclick={() => resetOverride(override)}
                >
                  {resettingCommand === override.command ? 'Resetting…' : 'Reset'}
                </Button>
              </TableCell>
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </fieldset>
</div>
