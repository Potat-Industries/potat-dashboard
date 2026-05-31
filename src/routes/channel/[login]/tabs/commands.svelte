<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
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
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import type { ChannelCommand, CommandSettings, BotCommand } from '$lib/types';
  import {
    getChannelSettings,
    getChannelCommands,
    getBotCommands,
    getCommandSettings,
    createChannelCommand,
    updateChannelCommand,
    deleteChannelCommand,
    updateCommandSettings,
    deleteCommandSettings,
  } from '$lib/api/channels';

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

  const emptyCommandForm = (): CommandForm => ({
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
  let customLoading = $state(false);
  let prefix = $state('#');
  let customDialogOpen = $state(false);
  let editingId = $state<number | null>(null);
  let savingCommand = $state(false);
  let deletingId = $state<number | null>(null);
  let commandToDelete = $state<ChannelCommand | null>(null);
  let commandForm = $state<CommandForm>(emptyCommandForm());
  let customSearch = $state('');

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

  const emptyOverrideForm = (): OverrideForm => ({
    command: '',
    is_enabled: true,
    permission: null,
    custom_cooldown: null,
    silent_errors: false,
    offline_only: null,
    allow_bots: null,
    ambassador_granted: false,
  });

  let botCommands: BotCommand[] = $state([]);
  let overrides: CommandSettings[] = $state([]);
  let botLoading = $state(false);
  let overrideDialogOpen = $state(false);
  let editingOverrideCommand = $state<string | null>(null);
  let savingOverride = $state(false);
  let resettingCommand = $state<string | null>(null);
  let togglingCommand = $state<string | null>(null);
  let overrideForm = $state<OverrideForm>(emptyOverrideForm());
  let botSearch = $state('');

  const channelId = $derived($userState?.id ?? '');

  const filteredCommands = $derived(
    customSearch.trim()
      ? commands.filter(cmd => {
          const q = customSearch.toLowerCase();
          return (
            getUsage(cmd).toLowerCase().includes(q) ||
            (cmd.response ?? '').toLowerCase().includes(q) ||
            (cmd.run_command ?? '').toLowerCase().includes(q)
          );
        })
      : commands
  );

  const overrideMap = $derived(new Map(overrides.map(o => [o.command, o])));

  const displayCommands = $derived.by((): BotCommand[] => {
    const helpNames = new Set(botCommands.map(c => c.name));
    const overrideOnly: BotCommand[] = overrides
      .filter(o => !helpNames.has(o.command) && o.command.trim() !== '')
      .map(o => ({
        name: o.command,
        title: o.command,
        description: '',
        usage: '',
        category: '',
        cooldown: 0,
        level: 0,
        userRequires: 'NONE',
        botRequires: 'NONE',
        aliases: [],
        conditions: {},
        flags: [],
      }));
    return [...botCommands, ...overrideOnly].sort(
      (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  });

  const filteredBotCommands = $derived(
    botSearch.trim()
      ? displayCommands.filter(c => {
          const q = botSearch.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            (c.aliases ?? []).some(a => a.toLowerCase().includes(q))
          );
        })
      : displayCommands
  );

  const loadCustom = async () => {
    if (!channelId) return;
    customLoading = true;
    try {
      const [cmds, settings] = await Promise.all([
        getChannelCommands(channelId),
        getChannelSettings(channelId),
      ]);
      commands = cmds;
      prefix = (settings as Record<string, string>).prefix ?? '#';
    } catch (e) {
      toast.error('Failed to load commands', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      customLoading = false;
    }
  };

  const loadBot = async () => {
    botLoading = true;
    try {
      const [cmds, overrideList] = await Promise.all([
        getBotCommands(),
        channelId ? getCommandSettings(channelId) : Promise.resolve([]),
      ]);
      botCommands = cmds.sort((a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
      overrides = overrideList;
    } catch (e) {
      toast.error('Failed to load bot commands', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      botLoading = false;
    }
  };

  const stripPrefix = (t: string) => {
    if (!t) return '';
    if (t.startsWith('!')) return t.slice(1);
    if (prefix && t.startsWith(prefix)) return t.slice(prefix.length);
    return t;
  };

  const effectiveTrigger = (cmd: ChannelCommand): string => cmd.trigger || cmd.name || '';

  const getUsage = (cmd: ChannelCommand): string => {
    const t = effectiveTrigger(cmd);
    if (!t) return '(unknown)';
    if (t.startsWith('{any}')) return t;
    if (t.startsWith(prefix)) return t;
    if (t.startsWith('!')) return prefix + t.slice(1);
    return prefix + t;
  };

  const openCreateCommand = () => {
    editingId = null;
    commandForm = emptyCommandForm();
    customDialogOpen = true;
  };

  const openEditCommand = (cmd: ChannelCommand) => {
    editingId = cmd.command_id;
    commandForm = {
      trigger: stripPrefix(effectiveTrigger(cmd)),
      response: cmd.response,
      cooldown: cmd.cooldown,
      reply: cmd.reply,
      whisper: cmd.whisper,
      announce: cmd.announce,
      run_command: cmd.run_command ?? '',
      responseType: responseTypeFromFlags(cmd.reply, cmd.whisper, cmd.announce),
    };
    customDialogOpen = true;
  };

  const saveCommand = async () => {
    if (!commandForm.trigger.trim() || (!commandForm.response.trim() && !commandForm.run_command.trim())) {
      toast.error('Trigger and response (or run command) are required.');
      return;
    }
    savingCommand = true;
    const payload = {
      ...commandForm,
      reply:    commandForm.responseType === 'reply',
      whisper:  commandForm.responseType === 'whisper',
      announce: commandForm.responseType === 'announce',
    };
    try {
      if (editingId !== null) {
        await updateChannelCommand(channelId, editingId, payload);
        commands = commands.map(c => c.command_id === editingId ? { ...c, ...payload } : c);
        toast.success(`${prefix}${commandForm.trigger} updated`, { duration: 2000 });
      } else {
        const newCmd = await createChannelCommand(channelId, payload);
        if (newCmd) commands = [...commands, newCmd];
        toast.success(`${prefix}${commandForm.trigger} created`, { duration: 2000 });
      }
      customDialogOpen = false;
    } catch (e) {
      toast.error(editingId !== null ? 'Failed to update command' : 'Failed to create command', {
        description: e instanceof Error ? e.message : String(e), duration: 4000,
      });
    } finally {
      savingCommand = false;
    }
  };

  const deleteCommand = async () => {
    const cmd = commandToDelete;
    if (!cmd) return;
    deletingId = cmd.command_id;
    try {
      await deleteChannelCommand(channelId, cmd.command_id);
      commands = commands.filter(c => c.command_id !== cmd.command_id);
      toast.success(`${getUsage(cmd)} deleted`, { duration: 2000 });
    } catch (e) {
      toast.error('Failed to delete command', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      deletingId = null;
      commandToDelete = null;
    }
  };

  const openOverride = (commandName: string) => {
    const existing = overrideMap.get(commandName);
    editingOverrideCommand = existing ? commandName : null;
    overrideForm = existing
      ? {
          command: existing.command,
          is_enabled: existing.is_enabled,
          permission: (existing.permission as PermissionLevel) ?? null,
          custom_cooldown: existing.custom_cooldown ?? null,
          silent_errors: existing.silent_errors,
          offline_only: existing.offline_only ?? null,
          allow_bots: existing.allow_bots ?? null,
          ambassador_granted: existing.ambassador_granted,
        }
      : { ...emptyOverrideForm(), command: commandName };
    overrideDialogOpen = true;
  };

  const saveOverride = async () => {
    if (!overrideForm.command.trim()) {
      toast.error('Command name is required.');
      return;
    }
    savingOverride = true;
    const isNew = editingOverrideCommand === null;
    const payload: CommandSettings = {
      channel_id: channelId,
      command: overrideForm.command.trim().toLowerCase(),
      is_enabled: overrideForm.is_enabled,
      silent_errors: overrideForm.silent_errors,
      ambassador_granted: overrideForm.ambassador_granted,
      channel_usage: 0,
      platform: 'TWITCH',
      ...(overrideForm.permission !== null && { permission: overrideForm.permission }),
      ...(overrideForm.custom_cooldown !== null && { custom_cooldown: overrideForm.custom_cooldown }),
      ...(overrideForm.offline_only !== null && { offline_only: overrideForm.offline_only }),
      ...(overrideForm.allow_bots !== null && { allow_bots: overrideForm.allow_bots }),
    };
    try {
      await updateCommandSettings(payload);
      overrides = isNew
        ? [...overrides, payload]
        : overrides.map(o => o.command === editingOverrideCommand ? payload : o);
      toast.success(`"${payload.command}" override ${isNew ? 'created' : 'updated'}`, { duration: 2000 });
      overrideDialogOpen = false;
    } catch (e) {
      toast.error('Failed to save override', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      savingOverride = false;
    }
  };

  const resetOverride = async (commandName: string) => {
    resettingCommand = commandName;
    try {
      await deleteCommandSettings(channelId, commandName);
      overrides = overrides.filter(o => o.command !== commandName);
      toast.success(`"${commandName}" reset to defaults`, { duration: 2000 });
    } catch (e) {
      toast.error('Failed to reset override', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      resettingCommand = null;
    }
  };

  const toggleEnabled = async (commandName: string, enabled: boolean) => {
    const existing = overrideMap.get(commandName);
    // Toggling ON with no override = already default, nothing to persist
    if (enabled && !existing) return;

    const payload: CommandSettings = {
      channel_id: channelId,
      command: commandName,
      is_enabled: enabled,
      silent_errors: existing?.silent_errors ?? false,
      ambassador_granted: existing?.ambassador_granted ?? false,
      channel_usage: existing?.channel_usage ?? 0,
      platform: 'TWITCH',
      ...(existing?.permission && { permission: existing.permission }),
      ...(existing?.custom_cooldown != null && { custom_cooldown: existing.custom_cooldown }),
      ...(existing?.offline_only != null && { offline_only: existing.offline_only }),
      ...(existing?.allow_bots != null && { allow_bots: existing.allow_bots }),
    };

    togglingCommand = commandName;
    try {
      await updateCommandSettings(payload);
      if (existing) {
        overrides = overrides.map(o => o.command === commandName ? { ...o, is_enabled: enabled } : o);
      } else {
        overrides = [...overrides, payload];
      }
      toast.success(`"${commandName}" ${enabled ? 'enabled' : 'disabled'}`, { duration: 2000 });
    } catch (e) {
      toast.error('Failed to update command', { description: e instanceof Error ? e.message : String(e), duration: 4000 });
    } finally {
      togglingCommand = null;
    }
  };

  onMount(() => {
    loadCustom();
    loadBot();
  });
</script>

<!-- Delete command confirmation -->
<AlertDialog.Root open={commandToDelete !== null} onOpenChange={(o) => { if (!o) commandToDelete = null; }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete {commandToDelete ? getUsage(commandToDelete) : ''}?</AlertDialog.Title>
      <AlertDialog.Description>
        This command will be permanently deleted and cannot be recovered.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        on:click={deleteCommand}
        disabled={deletingId !== null}
      >
        {deletingId !== null ? 'Deleting…' : 'Delete'}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<!-- Custom command dialog -->
<Dialog bind:open={customDialogOpen}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>{editingId !== null ? 'Edit Command' : 'New Command'}</DialogTitle>
      <DialogDescription>
        Use <code class="rounded bg-muted px-1 py-0.5 text-xs">{'{user}'}</code>,
        <code class="rounded bg-muted px-1 py-0.5 text-xs">{'{channel}'}</code>,
        <code class="rounded bg-muted px-1 py-0.5 text-xs">{'{0}'}</code>, etc. in your response.
        See the <a href="/dashboard/docs" class="text-primary underline">docs</a> for all variables.
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-2">
      <div class="grid gap-1.5">
        <Label for="trigger">Trigger <span class="text-destructive">*</span></Label>
        <Input id="trigger" bind:value={commandForm.trigger} placeholder="e.g. lurk" maxlength={32} />
      </div>
      <div class="grid gap-1.5">
        <Label for="response">Response</Label>
        <Textarea
          id="response"
          bind:value={commandForm.response}
          placeholder={'e.g. {user} is now lurking! PoroSad'}
          rows={3}
        />
      </div>
      <div class="grid gap-1.5">
        <Label for="run_command">
          Run Command
          <span class="text-xs text-muted-foreground">(optional — runs another command instead)</span>
        </Label>
        <Input id="run_command" bind:value={commandForm.run_command} placeholder={'e.g. echo Hello {0+}'} />
      </div>
      <div class="grid gap-1.5">
        <Label for="cooldown">Cooldown (seconds)</Label>
        <Input id="cooldown" type="number" min={0} max={3600} bind:value={commandForm.cooldown} />
      </div>
      <div class="grid gap-1.5">
        <Label for="responseType">Response Type</Label>
        <Select.Root
          selected={{ value: commandForm.responseType, label: responseTypeOptions.find(o => o.value === commandForm.responseType)?.label }}
          onSelectedChange={(s) => { if (s) commandForm.responseType = s.value as ResponseType; }}
        >
          <Select.Trigger id="responseType" class="w-full">
            <Select.Value placeholder="Select response type" />
          </Select.Trigger>
          <Select.Content class="w-[var(--radix-select-trigger-width)] rounded-md border shadow-lg">
            {#each responseTypeOptions as opt}
              <Select.Item value={opt.value}>{opt.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" on:click={() => (customDialogOpen = false)}>Cancel</Button>
      <Button disabled={savingCommand} on:click={saveCommand}>
        {savingCommand ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Create'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Override dialog -->
<Dialog bind:open={overrideDialogOpen}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Configure "{overrideForm.command}"</DialogTitle>
      <DialogDescription>
        Override this command's settings for your channel.
        Leave optional fields unset to inherit the channel defaults.
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-2">
      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Enabled</p>
          <p class="text-xs text-muted-foreground">Allow the command to be used in this channel</p>
        </div>
        <Switch bind:checked={overrideForm.is_enabled} />
      </div>

      <div class="grid gap-1.5">
        <Label>Permission override <span class="text-xs text-muted-foreground">(optional)</span></Label>
        <Select.Root
          selected={overrideForm.permission ? { value: overrideForm.permission, label: permissionLevels.find(p => p.value === overrideForm.permission)?.label } : undefined}
          onSelectedChange={(s) => { overrideForm.permission = s ? (s.value as PermissionLevel) : null; }}
        >
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Inherit from channel settings" />
          </Select.Trigger>
          <Select.Content class="w-[var(--radix-select-trigger-width)] rounded-md border shadow-lg">
            {#each permissionLevels as level}
              <Select.Item value={level.value}>{level.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="grid gap-1.5">
        <Label for="ov-cooldown">
          Custom cooldown (seconds)
          <span class="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="ov-cooldown"
          type="number"
          min={0}
          max={3600}
          placeholder="Inherit from channel settings"
          value={overrideForm.custom_cooldown ?? ''}
          oninput={(e) => {
            const v = (e.currentTarget as HTMLInputElement).value;
            overrideForm.custom_cooldown = v === '' ? null : Number(v);
          }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Silent errors</p>
          <p class="text-xs text-muted-foreground">Suppress permission error messages</p>
        </div>
        <Switch bind:checked={overrideForm.silent_errors} />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Offline only</p>
          <p class="text-xs text-muted-foreground">Only allow the command when the channel is offline</p>
        </div>
        <Switch
          checked={overrideForm.offline_only ?? false}
          onCheckedChange={(v) => { overrideForm.offline_only = v; }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Allow bots</p>
          <p class="text-xs text-muted-foreground">Let bots trigger this command</p>
        </div>
        <Switch
          checked={overrideForm.allow_bots ?? false}
          onCheckedChange={(v) => { overrideForm.allow_bots = v; }}
        />
      </div>

      <div class="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p class="text-sm font-medium">Ambassador granted</p>
          <p class="text-xs text-muted-foreground">Ambassadors can use this regardless of permission level</p>
        </div>
        <Switch bind:checked={overrideForm.ambassador_granted} />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => (overrideDialogOpen = false)}>Cancel</Button>
      <Button disabled={savingOverride} onclick={saveOverride}>
        {savingOverride ? 'Saving…' : 'Save Override'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<div class="flex justify-center px-4 py-6">
  <div class="w-full max-w-5xl">
    <Tabs.Root value="custom">
      <Tabs.List class="mb-4 w-full justify-start">
        <Tabs.Trigger value="custom">Custom Commands</Tabs.Trigger>
        <Tabs.Trigger value="bot">Default Commands</Tabs.Trigger>
      </Tabs.List>

      <!-- ── Custom Commands ── -->
      <Tabs.Content value="custom">
        <fieldset class="rounded-lg border p-6">
          <legend class="px-2 text-lg font-semibold">Custom Commands</legend>
          <div class="mb-4 flex items-center justify-between gap-2">
            <Input placeholder="Search commands…" bind:value={customSearch} class="max-w-xs" />
            <Button on:click={openCreateCommand} size="sm">+ New Command</Button>
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
              {#if customLoading}
                <TableRow>
                  <TableCell colspan={6} class="py-8 text-center text-muted-foreground">
                    Loading commands…
                  </TableCell>
                </TableRow>
              {:else if filteredCommands.length === 0}
                <TableRow>
                  <TableCell colspan={6} class="py-8 text-center text-muted-foreground">
                    {#if customSearch}
                      No commands match "<strong>{customSearch}</strong>".
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
                    <TableCell class="flex flex-wrap gap-1">
                      {#if cmd.reply}<Badge variant="outline" class="text-xs">reply</Badge>{/if}
                      {#if cmd.whisper}<Badge variant="outline" class="text-xs">whisper</Badge>{/if}
                      {#if cmd.announce}<Badge variant="outline" class="text-xs">announce</Badge>{/if}
                      {#if !cmd.reply && !cmd.whisper && !cmd.announce}
                        <span class="text-xs text-muted-foreground">—</span>
                      {/if}
                    </TableCell>
                    <TableCell>{cmd.use_count.toLocaleString()}</TableCell>
                    <TableCell class="flex gap-2">
                      <Button variant="outline" size="sm" on:click={() => openEditCommand(cmd)}>Edit</Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === cmd.command_id}
                        on:click={() => (commandToDelete = cmd)}
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
      </Tabs.Content>

      <Tabs.Content value="bot">
        <fieldset class="rounded-lg border p-6">
          <legend class="px-2 text-lg font-semibold">Default Commands</legend>
          <p class="mb-4 text-sm text-muted-foreground">
            These are PotatBotat's built-in commands. Toggle them on/off or configure per-channel settings.
          </p>
          <div class="mb-4">
            <Input placeholder="Search by name, category, or description…" bind:value={botSearch} class="max-w-xs" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Command</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Default cooldown</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#if botLoading}
                <TableRow>
                  <TableCell colspan={5} class="py-8 text-center text-muted-foreground">
                    Loading default commands…
                  </TableCell>
                </TableRow>
              {:else if filteredBotCommands.length === 0}
                <TableRow>
                  <TableCell colspan={5} class="py-8 text-center text-muted-foreground">
                    {#if botSearch}
                      No commands match "<strong>{botSearch}</strong>".
                    {:else}
                      No default commands found.
                    {/if}
                  </TableCell>
                </TableRow>
              {:else}
                {#each filteredBotCommands as cmd (cmd.name)}
                  {@const override = overrideMap.get(cmd.name)}
                  <TableRow>
                    <TableCell class="font-mono text-sm text-primary">{cmd.name}</TableCell>
                    <TableCell>
                      {#if cmd.category}
                        <Badge variant="outline" class="text-xs capitalize">{cmd.category}</Badge>
                      {:else}
                        <span class="text-muted-foreground">—</span>
                      {/if}
                    </TableCell>
                    <TableCell class="text-sm text-muted-foreground">{cmd.cooldown}s</TableCell>
                    <TableCell>
                      <Switch
                        checked={override ? override.is_enabled : true}
                        disabled={togglingCommand === cmd.name}
                        onCheckedChange={(v) => toggleEnabled(cmd.name, v)}
                      />
                    </TableCell>
                    <TableCell class="flex gap-2">
                      <Button variant="outline" size="sm" onclick={() => openOverride(cmd.name)}>Edit</Button>
                      {#if override}
                        <Button
                          variant="ghost"
                          size="sm"
                          class="text-muted-foreground hover:text-destructive"
                          disabled={resettingCommand === cmd.name}
                          onclick={() => resetOverride(cmd.name)}
                        >
                          {resettingCommand === cmd.name ? 'Resetting…' : 'Reset'}
                        </Button>
                      {/if}
                    </TableCell>
                  </TableRow>
                {/each}
              {/if}
            </TableBody>
          </Table>
        </fieldset>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>
