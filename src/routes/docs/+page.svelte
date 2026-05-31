<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { userState } from '$lib/store/LocalStorage.svelte';

  let activeSection = $state('overview');

  const tocItems = [
    { id: 'overview', label: 'Overview', indent: false },
    { id: 'permission-levels', label: 'Permission Levels', indent: false },
    { id: 'channel-settings', label: 'Channel Settings', indent: false },
    { id: 'user-settings', label: 'User Settings', indent: false },
    { id: 'custom-commands', label: 'Custom Commands', indent: false },
    { id: 'response-variables', label: 'Response Variables', indent: true },
    { id: 'pipe-variables', label: 'Pipe Variables', indent: true },
    { id: 'command-wildcard', label: 'Command Wildcard', indent: true },
    { id: 'command-flags', label: 'Command Flags', indent: true },
    { id: 'pyramid-response', label: 'Pyramid Response', indent: false },
    { id: 'emote-streak', label: 'Emote Streak', indent: false },
    { id: 'follow-responses', label: 'Follow Responses', indent: false },
    { id: 'giveaway', label: 'Giveaway', indent: false },
  ];

  let scrollLock = false;
  let scrollLockTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (!browser) return;

    let sections = Array.from(document.querySelectorAll<HTMLElement>('fieldset[id]'));

    const refreshSections = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>('fieldset[id]'));
    };

    const updateActive = () => {
      if (scrollLock) return;
      const threshold = window.innerHeight * 0.35;
      const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 32;
      if (nearBottom) {
        activeSection = sections[sections.length - 1]?.id ?? activeSection;
        return;
      }
      let current = sections[0]?.id ?? 'overview';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) {
          current = section.id;
        }
      }
      activeSection = current;
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', refreshSections, { passive: true });
    updateActive();
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', refreshSections);
      if (scrollLockTimer) { clearTimeout(scrollLockTimer); scrollLockTimer = null; }
    };
  });

  function scrollTo(id: string) {
    activeSection = id;
    history.replaceState(null, '', `#${id}`);
    scrollLock = true;
    if (scrollLockTimer) clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => { scrollLock = false; }, 800);
    const el = document.getElementById(id);
    if (!el) return;
    const headerHeight = (document.querySelector('header') as HTMLElement | null)?.offsetHeight ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }
</script>

<div class="flex px-4 py-8 max-w-6xl mx-auto gap-8">
  <!-- Sidebar TOC -->
  <aside class="hidden lg:block w-52 shrink-0">
    <div class="sticky top-8">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">On this page</p>
      <nav class="flex flex-col gap-0.5">
        {#each tocItems as item}
          <a
            href="#{item.id}"
            onclick={(e) => { e.preventDefault(); scrollTo(item.id); }}
            class="block text-left text-sm py-1 px-2 rounded transition-colors {item.indent ? 'pl-6' : ''} {activeSection === item.id ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>
  </aside>

  <!-- Main Content -->
  <div class="flex-1 min-w-0 space-y-8 pb-12">

    <div class="text-center space-y-2 pb-4">
      <h1 class="text-3xl font-bold">PotatBotat Documentation</h1>
    </div>

    <!-- Overview -->
    <fieldset id="overview" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Overview</legend>
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>
          <span class="font-semibold text-foreground">PotatBotat</span> is a multi-platform chat bot supporting
          <span class="font-medium text-foreground">Twitch</span>,
          <span class="font-medium text-foreground">Kick</span>, and
          <span class="font-medium text-foreground">Discord</span>.
          It provides commands, emote tracking, custom commands, moderation utilities, and channel automation features.
        </p>
        <p>
          The dashboard lets broadcasters and users configure settings, create custom commands, and view emote statistics.
        </p>
      </div>
    </fieldset>

    <!-- Permission Levels -->
    <fieldset id="permission-levels" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Permission Levels</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used in channel settings to restrict who can use commands. Levels are ordered from least to most privileged.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Level</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">NONE</code></td>
              <td class="py-2 text-muted-foreground">Everyone (no restriction)</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">SUBSCRIBER</code></td>
              <td class="py-2 text-muted-foreground">Channel subscribers and above</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">VIP</code></td>
              <td class="py-2 text-muted-foreground">VIPs and above</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">MOD</code></td>
              <td class="py-2 text-muted-foreground">Moderators and above</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">AMBASSADOR</code></td>
              <td class="py-2 text-muted-foreground">PotatBotat ambassadors and above</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">BROADCASTER</code></td>
              <td class="py-2 text-muted-foreground">Channel broadcaster only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Channel Settings -->
    <fieldset id="channel-settings" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Channel Settings</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Configurable on your <a href={$userState?.login ? `/dashboard/channel/${$userState.login}#settings` : '/dashboard'} class="text-primary hover:underline">channel settings</a> tab. These apply to all commands in your channel by default.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-4 font-semibold w-52">Setting</th>
              <th class="text-left py-2 pr-4 font-semibold w-24">Type</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">prefix</code></td>
              <td class="py-2 pr-4 text-muted-foreground">text</td>
              <td class="py-2 text-muted-foreground">The prefix used for commands. Default: <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">#</code></td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">permission</code></td>
              <td class="py-2 pr-4 text-muted-foreground">choice</td>
              <td class="py-2 text-muted-foreground">Minimum permission level required to use commands globally.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">online_permission</code></td>
              <td class="py-2 pr-4 text-muted-foreground">choice</td>
              <td class="py-2 text-muted-foreground">Minimum permission level required to use commands while the channel is live.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">language</code></td>
              <td class="py-2 pr-4 text-muted-foreground">choice</td>
              <td class="py-2 text-muted-foreground">The language the bot uses when responding in your channel.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">force_language</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, overrides individual user language preferences and always responds in the channel language.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">color_responses</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, bot responses are sent using <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">/me</code> (colored text).</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">no_reply</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, the bot won't mention or reply to users in responses.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">silent_errors</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, permission error messages are suppressed.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">online_silent_errors</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, permission error messages are suppressed while the channel is live.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">offline_only</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, the bot will only respond to commands when the channel is offline.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">whisper_only</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, all bot responses are sent as whispers.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">online_whisper_only</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, all bot responses are sent as whispers while the channel is live.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">channel_cooldown</code></td>
              <td class="py-2 pr-4 text-muted-foreground">number</td>
              <td class="py-2 text-muted-foreground">Global cooldown in seconds between any commands in the channel (shared across all users).</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">user_cooldown</code></td>
              <td class="py-2 pr-4 text-muted-foreground">number</td>
              <td class="py-2 text-muted-foreground">Per-user cooldown in seconds between commands (per person, per channel).</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">paj_bot</code></td>
              <td class="py-2 pr-4 text-muted-foreground">text</td>
              <td class="py-2 text-muted-foreground">URL for a pajbot banphrase API. If a response would match a banphrase, it will be suppressed.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">allow_bot_emote_tracking</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, emote usage by known chatbots is also counted in emote stats.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">ignore_dropped</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, the bot won't attempt a fallback whisper when a chat message fails to send.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">pyramid_response</code></td>
              <td class="py-2 pr-4 text-muted-foreground">text</td>
              <td class="py-2 text-muted-foreground">Custom response sent when a user completes an emote pyramid. Supports <a href="#pyramid-response" class="text-primary hover:underline">pyramid variables</a>.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">emote_streak_response</code></td>
              <td class="py-2 pr-4 text-muted-foreground">text</td>
              <td class="py-2 text-muted-foreground">Custom response sent when a user ends an emote streak. Supports <a href="#emote-streak" class="text-primary hover:underline">streak variables</a>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- User Settings -->
    <fieldset id="user-settings" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">User Settings</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Configurable on your <a href="/dashboard/user" class="text-primary hover:underline">user settings</a> tab. These apply to you personally across all channels.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-4 font-semibold w-52">Setting</th>
              <th class="text-left py-2 pr-4 font-semibold w-24">Type</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">language</code></td>
              <td class="py-2 pr-4 text-muted-foreground">choice</td>
              <td class="py-2 text-muted-foreground">The language the bot uses when responding to you in chat. Can be overridden per channel by <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">force_language</code>.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">color_responses</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, bot responses to you are sent using <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">/me</code> (colored text).</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">no_reply</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, the bot won't mention or reply to you in responses.</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">ignore_dropped</code></td>
              <td class="py-2 pr-4 text-muted-foreground">boolean</td>
              <td class="py-2 text-muted-foreground">If enabled, the bot won't attempt a fallback whisper to you when a message fails to send.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Custom Commands -->
    <fieldset id="custom-commands" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Custom Commands</legend>
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>
          Custom commands let you define your own chat triggers and responses. Manage them on your
          <a href={$userState?.login ? `/dashboard/channel/${$userState.login}#custom-commands` : '/dashboard'} class="text-primary hover:underline">channel Commands tab</a>.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm mt-2">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 pr-4 font-semibold w-36">Field</th>
                <th class="text-left py-2 font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr>
                <td class="py-2 pr-4 font-medium text-foreground">Trigger</td>
                <td class="py-2">The keyword users type (without prefix). E.g. trigger <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">lurk</code> responds to <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">#lurk</code>. Supports the <a href="#command-wildcard" class="text-primary hover:underline">{'{any}'} wildcard</a>.</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-medium text-foreground">Response</td>
                <td class="py-2">The message the bot sends. Supports all <a href="#response-variables" class="text-primary hover:underline">response variables</a>.</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-medium text-foreground">Run Command</td>
                <td class="py-2">Instead of a plain response, run another bot command. The output of that command becomes the response. Supports <a href="#response-variables" class="text-primary hover:underline">response variables</a> and <a href="#pipe-variables" class="text-primary hover:underline">pipe variables</a>.</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-medium text-foreground">Cooldown</td>
                <td class="py-2">Per-command cooldown in seconds before the command can be used again.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </fieldset>

    <!-- Response Variables -->
    <fieldset id="response-variables" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Response Variables</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Available in the <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">response</code> and
        <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">run command</code> fields of a custom command.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{user}'}</code></td>
              <td class="py-2 text-muted-foreground">Triggering user's display name</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{channel}'}</code></td>
              <td class="py-2 text-muted-foreground">Channel login name</td>
            </tr>
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{N}'}</code>
                <span class="text-muted-foreground text-xs ml-1">(e.g. {'{0}'}, {'{1}'})</span>
              </td>
              <td class="py-2 text-muted-foreground">Nth word of the triggering message (0-indexed, after the command trigger)</td>
            </tr>
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{N+}'}</code>
                <span class="text-muted-foreground text-xs ml-1">(e.g. {'{0+}'}, {'{1+}'})</span>
              </td>
              <td class="py-2 text-muted-foreground">Everything from the Nth word onwards</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Pipe Variables -->
    <fieldset id="pipe-variables" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">#pipe Variables</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used when chaining commands with a pipe <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">|</code>.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-48">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{N}'}</code>
                <span class="text-muted-foreground text-xs ml-1">/ </span>
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{N+}'}</code>
              </td>
              <td class="py-2 text-muted-foreground">Nth word / rest from previous command's output</td>
            </tr>
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{[N]M}'}</code>
                <span class="text-muted-foreground text-xs ml-1">/ </span>
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{[N]M+}'}</code>
              </td>
              <td class="py-2 text-muted-foreground">Mth word from the output of the Nth command in the chain (0-indexed)</td>
            </tr>
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{^N}'}</code>
                <span class="text-muted-foreground text-xs ml-1">/ </span>
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{^N+}'}</code>
              </td>
              <td class="py-2 text-muted-foreground">Nth word / rest from the parent command's raw input</td>
            </tr>
            <tr>
              <td class="py-2 pr-6">
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{^^N}'}</code>
                <span class="text-muted-foreground text-xs ml-1">/ </span>
                <code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{^^N+}'}</code>
              </td>
              <td class="py-2 text-muted-foreground">Nth word / rest from the grandparent command's raw input</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Command Name Wildcard -->
    <fieldset id="command-wildcard" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Command Name Wildcard</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used in the <span class="font-medium">trigger</span> field of a command to match any prefix character.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Token</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{any}'}</code></td>
              <td class="py-2 text-muted-foreground">
                Matches any prefix character. E.g. <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">{'{any}'}test</code>
                triggers on <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">!test</code>,
                <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">#test</code>,
                <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">$test</code>, etc.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Command Flags -->
    <fieldset id="command-flags" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">Command Flags</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Optional flags that change how the bot delivers a custom command's response.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-28">Flag</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Reply</code></td>
              <td class="py-2 text-muted-foreground">Bot uses Twitch's native reply thread to respond to the triggering message.</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Whisper</code></td>
              <td class="py-2 text-muted-foreground">Bot sends the response as a whisper directly to the triggering user instead of in chat.</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Announce</code></td>
              <td class="py-2 text-muted-foreground">Bot uses <code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">/announce</code> to post the response as a highlighted chat announcement.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Pyramid Response Variables -->
    <fieldset id="pyramid-response" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">#pyramidresponse Variables</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used in the channel's <span class="font-medium">pyramid response</span> setting.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{emote}'}</code></td>
              <td class="py-2 text-muted-foreground">Emote name used in the pyramid</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{width}'}</code></td>
              <td class="py-2 text-muted-foreground">Max width of the completed pyramid</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{user}'}</code></td>
              <td class="py-2 text-muted-foreground">User who completed the pyramid</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{time}'}</code></td>
              <td class="py-2 text-muted-foreground">Time it took to complete</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Emote Streak Variables -->
    <fieldset id="emote-streak" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">#emotestreak Variables</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used in the channel's <span class="font-medium">emote streak response</span> setting.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{emote}'}</code></td>
              <td class="py-2 text-muted-foreground">Emote that was streaked</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{count}'}</code></td>
              <td class="py-2 text-muted-foreground">Number of messages in the streak</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{user}'}</code></td>
              <td class="py-2 text-muted-foreground">User who broke the streak</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{time}'}</code></td>
              <td class="py-2 text-muted-foreground">Duration of the streak</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{users}'}</code></td>
              <td class="py-2 text-muted-foreground">Number of unique users who participated</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Follow Response Variables -->
    <fieldset id="follow-responses" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">#followresponses Variable</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Used in the channel's <span class="font-medium">follow response</span> setting.
        Note: uses <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{'${}' }</code> syntax instead of <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{'{}'}</code>.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'${name}'}</code></td>
              <td class="py-2 text-muted-foreground">Display name of the user who just followed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

    <!-- Giveaway Variables -->
    <fieldset id="giveaway" class="rounded-lg border p-6 shadow-sm">
      <legend class="px-2 text-lg font-semibold">#giveaway output: Variables</legend>
      <p class="text-sm text-muted-foreground mb-4">
        Available in the giveaway output message.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 pr-6 font-semibold w-40">Variable</th>
              <th class="text-left py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{trigger}'}</code></td>
              <td class="py-2 text-muted-foreground">The entry trigger/keyword for the giveaway</td>
            </tr>
            <tr>
              <td class="py-2 pr-6"><code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{'{duration}'}</code></td>
              <td class="py-2 text-muted-foreground">Human-readable duration of the giveaway</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>

  </div>
</div>

<style>
  code {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  }
</style>
