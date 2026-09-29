<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
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
  import type { ChannelCommand } from '$lib/types';

  type ResponseType = 'normal' | 'reply' | 'whisper' | 'announce';

  type CommandForm = {
    trigger: string;
    response: string;
    cooldown: number;
    reply: boolean;
    whisper: boolean;
    announce: boolean;
    run_command: string;
    responseType: ResponseType;
  };

  const emptyForm = (): CommandForm => ({
    trigger: '',
    response: '',
    cooldown: 5,
    reply: false,
    whisper: false,
    announce: false,
    run_command: '',
    responseType: 'normal',
  });

  const responseTypeFromFlags = (reply: boolean, whisper: boolean, announce: boolean): ResponseType => {
    if (reply) return 'reply';
    if (whisper) return 'whisper';
    if (announce) return 'announce';
    return 'normal';
  };

  const responseTypeOptions: { value: ResponseType; label: string }[] = [
    { value: 'normal',   label: 'Normal' },
    { value: 'reply',    label: 'Reply' },
    { value: 'whisper',  label: 'Whisper' },
    { value: 'announce', label: 'Announce' },
  ];

  let commands: ChannelCommand[] = $state([]);
  let isLoading = $state(false);
  let prefix = $state('#');
  let dialogOpen = $state(false);
  let editingId = $state<number | null>(null);
  let savingForm = $state(false);
  let deletingId = $state<number | null>(null);
  let form = $state<CommandForm>(emptyForm());
  let search = $state('');

  const channelId = $derived($userState?.id ?? '');

  const filteredCommands = $derived(
    search.trim()
      ? commands.filter(cmd => {
          const q = search.toLowerCase();
          return (
            getUsage(cmd).toLowerCase().includes(q) ||
            (cmd.response ?? '').toLowerCase().includes(q) ||
            (cmd.run_command ?? '').toLowerCase().includes(q)
          );
        })
      : commands
  );

  const load = async () => {
    if (!channelId) return;
    isLoading = true;
    try {
      const [cmdRes, settingsRes] = await Promise.all([
        fetchBackend<ChannelCommand>('channel/commands', {
          auth: true,
          params: { id: channelId },
        }),
        fetchBackend<Record<string, unknown>>('channel/settings', {
          auth: true,
          params: { id: channelId },
        }),
      ]);
      if (cmdRes.errors?.length) {
        toast.error('Failed to load commands', { description: cmdRes.errors[0].message, duration: 4000 });
      } else {
        commands = cmdRes.data ?? [];
      }
      if (!settingsRes.errors?.length && settingsRes.data?.[0]) {
        prefix = (settingsRes.data[0] as Record<string, string>).prefix ?? '#';
      }
    } finally {
      isLoading = false;
    }
  };

  const openCreate = () => {
    editingId = null;
    form = emptyForm();
    dialogOpen = true;
  };

  const stripPrefix = (t: string) => {
    if (!t) return '';
    if (t.startsWith('!')) return t.slice(1);
    if (prefix && t.startsWith(prefix)) return t.slice(prefix.length);
    return t;
  };

  // The bare trigger name (no prefix), falling back to name field
  const effectiveTrigger = (cmd: ChannelCommand): string =>
    cmd.trigger || cmd.name || '';

  // What a user actually types in chat to call this command
  const getUsage = (cmd: ChannelCommand): string => {
    const t = effectiveTrigger(cmd);
    if (!t) return '(unknown)';
    if (t.startsWith('{any}')) return t;          // already has wildcard prefix indicator
    if (t.startsWith(prefix)) return t;           // already has prefix stored
    if (t.startsWith('!')) return prefix + t.slice(1); // replace legacy ! with real prefix
    return prefix + t;
  };

  const openEdit = (cmd: ChannelCommand) => {
    editingId = cmd.command_id;
    form = {
      trigger: stripPrefix(effectiveTrigger(cmd)),
      response: cmd.response,
      cooldown: cmd.cooldown,
      reply: cmd.reply,
      whisper: cmd.whisper,
      announce: cmd.announce,
      run_command: cmd.run_command ?? '',
      responseType: responseTypeFromFlags(cmd.reply, cmd.whisper, cmd.announce),
    };
    dialogOpen = true;
  };

  const saveCommand = async () => {
    if (!form.trigger.trim() || (!form.response.trim() && !form.run_command.trim())) {
      toast.error('Trigger and response (or run command) are required.');
      return;
    }
    savingForm = true;
    const payload = {
      ...form,
      reply:    form.responseType === 'reply',
      whisper:  form.responseType === 'whisper',
      announce: form.responseType === 'announce',
    };
    try {
      if (editingId !== null) {
        const res = await fetchBackend<ChannelCommand>('channel/commands', {
          method: 'PATCH',
          auth: true,
          params: { id: channelId, command_id: String(editingId) },
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.errors?.length) {
          toast.error('Failed to update command', { description: res.errors[0].message, duration: 4000 });
          return;
        }
        commands = commands.map((c) =>
          c.command_id === editingId ? { ...c, ...payload } : c
        );
        toast.success(`${prefix}${form.trigger} updated`, { duration: 2000 });
      } else {
        const res = await fetchBackend<ChannelCommand>('channel/commands', {
          method: 'POST',
          auth: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, channel_id: channelId }),
        });
        if (res.errors?.length) {
          toast.error('Failed to create command', { description: res.errors[0].message, duration: 4000 });
          return;
        }
        if (res.data?.[0]) commands = [...commands, res.data[0]];
        toast.success(`${prefix}${form.trigger} created`, { duration: 2000 });
      }
      dialogOpen = false;
    } finally {
      savingForm = false;
    }
  };

  const deleteCommand = async (cmd: ChannelCommand) => {
    deletingId = cmd.command_id;
    try {
      const res = await fetchBackend('channel/commands', {
        method: 'DELETE',
        auth: true,
        params: { id: channelId, command_id: String(cmd.command_id) },
      });
      if (res.errors?.length) {
        toast.error('Failed to delete command', { description: res.errors[0].message, duration: 4000 });
        return;
      }
      commands = commands.filter((c) => c.command_id !== cmd.command_id);
      toast.success(`${getUsage(cmd)} deleted`, { duration: 2000 });
    } finally {
      deletingId = null;
    }
  };

  onMount(load);
</script>

<Dialog bind:open={dialogOpen}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>{editingId !== null ? 'Edit Command' : 'New Command'}</DialogTitle>
      <DialogDescription>
        Use <code class="text-xs bg-muted px-1 py-0.5 rounded">{'{user}'}</code>,
        <code class="text-xs bg-muted px-1 py-0.5 rounded">{'{channel}'}</code>,
        <code class="text-xs bg-muted px-1 py-0.5 rounded">{'{0}'}</code>, etc. in your response.
        See the <a href="/dashboard/docs" class="underline text-primary">docs</a> for all variables.
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-2">
      <div class="grid gap-1.5">
        <Label for="trigger">Trigger <span class="text-destructive">*</span></Label>
        <Input id="trigger" bind:value={form.trigger} placeholder="e.g. lurk" maxlength={32} />
      </div>
      <div class="grid gap-1.5">
        <Label for="response">Response</Label>
        <Textarea
          id="response"
          bind:value={form.response}
          placeholder={'e.g. {user} is now lurking! PoroSad'}
          rows={3}
        />
      </div>
      <div class="grid gap-1.5">
        <Label for="run_command">Run Command <span class="text-muted-foreground text-xs">(optional — runs another command instead)</span></Label>
        <Input id="run_command" bind:value={form.run_command} placeholder={'e.g. echo Hello {0+}'} />
      </div>
      <div class="grid gap-1.5">
        <Label for="cooldown">Cooldown (seconds)</Label>
        <Input id="cooldown" type="number" min={0} max={3600} bind:value={form.cooldown} />
      </div>
      <div class="grid gap-1.5">
        <Label for="responseType">Response Type</Label>
        <Select.Root
          selected={{ value: form.responseType, label: responseTypeOptions.find(o => o.value === form.responseType)?.label }}
          onSelectedChange={(s) => { if (s) form.responseType = s.value as ResponseType; }}
        >
          <Select.Trigger id="responseType" class="w-full">
            <Select.Value placeholder="Select response type" />
          </Select.Trigger>
          <Select.Content class="w-[var(--radix-select-trigger-width)] border rounded-md shadow-lg">
            {#each responseTypeOptions as opt}
              <Select.Item value={opt.value}>{opt.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" on:click={() => (dialogOpen = false)}>Cancel</Button>
      <Button disabled={savingForm} on:click={saveCommand}>
        {savingForm ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Create'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<div class="flex justify-center">
  <fieldset class="w-full max-w-5xl rounded-lg border p-6">
    <legend class="px-2 text-lg font-semibold">Custom Commands</legend>
    <div class="flex justify-between items-center mb-4 gap-2">
      <Input
        placeholder="Search commands…"
        bind:value={search}
        class="max-w-xs"
      />
      <Button on:click={openCreate} size="sm">+ New Command</Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trigger / Usage</TableHead>
          <TableHead>Response</TableHead>
          <TableHead>Cooldown</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Uses</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if isLoading}
          <TableRow>
            <TableCell colspan={6}>Loading commands...</TableCell>
          </TableRow>
        {:else if filteredCommands.length === 0}
          <TableRow>
            <TableCell colspan={6} class="text-muted-foreground text-center py-8">
              {#if search}
                No commands match "<strong>{search}</strong>".
              {:else}
                No custom commands yet. Click <strong>+ New Command</strong> to create one.
              {/if}
            </TableCell>
          </TableRow>
        {:else}
          {#each filteredCommands as cmd (cmd.command_id)}
            <TableRow>
              <TableCell class="font-mono text-sm text-primary">{getUsage(cmd)}</TableCell>
              <TableCell class="max-w-xs truncate text-sm text-muted-foreground">
                {cmd.run_command ? `→ ${cmd.run_command}` : cmd.response}
              </TableCell>
              <TableCell>{cmd.cooldown}s</TableCell>
              <TableCell class="flex gap-1 flex-wrap">
                {#if cmd.reply}<Badge variant="outline" class="text-xs">reply</Badge>{/if}
                {#if cmd.whisper}<Badge variant="outline" class="text-xs">whisper</Badge>{/if}
                {#if cmd.announce}<Badge variant="outline" class="text-xs">announce</Badge>{/if}
                {#if !cmd.reply && !cmd.whisper && !cmd.announce}
                  <span class="text-muted-foreground text-xs">—</span>
                {/if}
              </TableCell>
              <TableCell>{cmd.use_count.toLocaleString()}</TableCell>
              <TableCell class="flex gap-2">
                <Button variant="outline" size="sm" on:click={() => openEdit(cmd)}>Edit</Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === cmd.command_id}
                  on:click={() => deleteCommand(cmd)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </fieldset>
</div>
