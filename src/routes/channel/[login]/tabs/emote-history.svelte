<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { getEmoteHistory, type EmoteHistoryEntry, type SimpleChannel } from '$lib/api/emotes';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import SkeletonImage from '$lib/components/skeleton-image/+skeleton-image.svelte';
  import { Input } from '$lib/components/ui/input/index.js';
  import Search from 'lucide-svelte/icons/search';

  interface ComputedExtras extends EmoteHistoryEntry {
    readonly user_url: string;
    readonly set_url: string;
    readonly method: string;
    readonly word: string;
    readonly expiry: string | null;
    readonly expired: boolean;
  }

  interface ProviderInfo {
    logo: string;
    home: string;
    name: string;
  }

  const providers: Record<string, ProviderInfo> = {
    '7TV': {
      logo: '/dashboard/7tv-logo.png',
      home: 'https://7tv.app/',
      name: '7TV',
    },
    STV: {
      logo: '/dashboard/7tv-logo.png',
      home: 'https://7tv.app/',
      name: '7TV',
    },
    FFZ: {
      logo: '/dashboard/ffz-logo.png',
      home: 'https://www.frankerfacez.com/',
      name: 'FrankerFaceZ',
    },
    BTTV: {
      logo: '/dashboard/bttv-logo.png',
      home: 'https://betterttv.com/',
      name: 'BetterTTV',
    },
  };

  const ACTION_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'ADD', label: 'Added' },
    { value: 'REMOVE', label: 'Removed' },
    { value: 'ALIAS', label: 'Renamed' },
  ];

  const PROVIDER_OPTIONS = [
    { value: 'STV', label: '7TV' },
    { value: 'BTTV', label: 'BTTV' },
    { value: 'FFZ', label: 'FFZ' },
  ];

  let loaded = $state(false);
  let isLoading = $state(false);
  let none = $state(false);
  let history: ComputedExtras[] = $state([]);
  let cursor: string | null = $state(null);
  const seenKeys = new Set<string>();
  let channel = $state<SimpleChannel>({ pfp: '', bestName: '', login: '', name: '' });
  let resolvedSetNames = $state<Record<string, string>>({});
  const fetchingSetIds = new Set<string>();

  async function resolveSetName(setId: string): Promise<void> {
    if (!setId || fetchingSetIds.has(setId) || resolvedSetNames[setId]) return;
    fetchingSetIds.add(setId);
    try {
      const res = await fetch(`https://7tv.io/v3/emote-sets/${setId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.name) resolvedSetNames = { ...resolvedSetNames, [setId]: data.name };
    } catch {
      // silently fail
    }
  }

  let userFilter = $state('');
  let emoteFilter = $state('');
  let actionFilter = $state('');
  let providerFilter = $state('');

  let sentinel = $state<HTMLDivElement | undefined>(undefined);

  const displayHistory = $derived(
    history.filter(e => {
      if (userFilter) {
        const q = userFilter.toLowerCase();
        if (!e.user_name.toLowerCase().includes(q) && !e.user_login.toLowerCase().includes(q)) return false;
      }
      if (emoteFilter) {
        const q = emoteFilter.toLowerCase();
        const names = [e.emote_name, e.emote_alias, e.emote_new_alias].filter(Boolean) as string[];
        if (!names.some(n => n.toLowerCase().includes(q))) return false;
      }
      if (actionFilter && e.action !== actionFilter) return false;
      if (providerFilter) {
        const match = providerFilter === 'STV' ? ['STV', '7TV'] : [providerFilter];
        if (!match.includes(e.provider)) return false;
      }
      return true;
    })
  );

  const hasActiveFilter = $derived(!!userFilter || !!emoteFilter || !!actionFilter || !!providerFilter);

  async function fetchEmoteHistory(pagination?: string | null) {
    if (isLoading) return;
    isLoading = true;
    try {
      const result = await getEmoteHistory($page.params.login!, { limit: 50, after: pagination ?? undefined });

      if (!result.history.length && history.length === 0) {
        none = true;
        return;
      }

      cursor = result.cursor;
      if (result.channel) channel = result.channel;

      for (const update of result.history) {
        const key = `${update.emote_id}:${update.ago}:${update.action}:${update.user_login}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        const prov = update.provider;
        let user_url = '';
        let set_url = '';
        let method = '';
        let word = '';

        if (update.action === 'ALIAS') {
          method = `renamed ${update.emote_name} to `;
          word = 'in';
        } else if (update.action === 'ADD') {
          method = 'added ';
          word = 'to';
        } else if (update.action === 'REMOVE') {
          method = 'removed ';
          word = 'from';
        }

        if (prov === '7TV' || prov === 'STV') {
          user_url = `https://7tv.app/users/${update.user_stv_id}`;
          set_url  = `https://7tv.app/emote-sets/${update.set_id}`;
        } else if (prov === 'BTTV') {
          user_url = `https://betterttv.com/users/${update.user_bttv_id}`;
          set_url  = `https://betterttv.com/users/${update.set_id}`;
        } else if (prov === 'FFZ') {
          user_url = `https://www.frankerfacez.com/channel/${update.user_login}`;
          set_url  = `https://www.frankerfacez.com/channel/${channel.login}`;
        }

        const entry: ComputedExtras = {
          ...update,
          user_pfp: update.user_stv_pfp || update.user_pfp,
          user_url,
          set_url,
          method,
          word,
          expiry:  update.expires_at ?? null,
          expired: update.is_expired ?? false,
        };
        history.push(entry);

        if ((!update.set_name || update.set_name.toLowerCase() === 'unknown') && (prov === '7TV' || prov === 'STV')) {
          resolveSetName(update.set_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch emote history:', err);
    } finally {
      loaded = true;
      isLoading = false;
    }
  }

  $effect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && cursor) {
          fetchEmoteHistory(cursor);
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  onMount(() => { fetchEmoteHistory(); });
</script>

<div class="flex justify-center px-4 py-6">
  <fieldset class="w-full max-w-5xl space-y-4 rounded-lg border p-6">
    <legend class="px-2 text-xl font-semibold">Emote Actions In {$page.params.login}</legend>

    <!-- Filter bar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-border pb-3">
      <div class="relative min-w-[140px] flex-1">
        <Search class="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
        <Input class="h-8 pl-8 text-sm" placeholder="Filter by user..." bind:value={userFilter} />
      </div>
      <div class="relative min-w-[140px] flex-1">
        <Search class="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
        <Input class="h-8 pl-8 text-sm" placeholder="Filter by emote..." bind:value={emoteFilter} />
      </div>
      <div class="flex gap-1">
        {#each ACTION_OPTIONS as opt}
          <button
            class={cn('rounded-md border px-2.5 py-1 text-xs transition-colors', actionFilter === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted')}
            onclick={() => { actionFilter = opt.value; }}
          >{opt.label}</button>
        {/each}
      </div>
      <div class="flex gap-1">
        {#each PROVIDER_OPTIONS as opt}
          <button
            class={cn('rounded-md border px-2.5 py-1 text-xs transition-colors', providerFilter === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted')}
            onclick={() => { providerFilter = providerFilter === opt.value ? '' : opt.value; }}
          >{opt.label}</button>
        {/each}
      </div>
    </div>

    {#if loaded && !none}
      <div id="container">
        <ul class="emote-list">
            {#each displayHistory as update (update.emote_id + update.ago + update.action + update.user_login)}
              <li class="emote-item flex gap-2">
                <div class="logo-container">
                  <SkeletonImage
                    class="h-10 max-h-10 max-w-10 rounded-full aspect-square"
                    src={providers[update.provider]?.logo ?? ''}
                    alt={`${providers[update.provider]?.name ?? update.provider} logo`}
                    title={providers[update.provider]?.name ?? update.provider}
                    href={providers[update.provider]?.home ?? '#'}
                  />
                </div>
                <div class="content-container flex items-center gap-2">
                  <div class="profile-picture">
                    <SkeletonImage
                      class="w-10 h-10 rounded-full"
                      src={update.user_stv_pfp || update.user_pfp}
                      alt={`${update.user_name} profile picture`}
                      title={`${update.user_name} profile picture`}
                      href={`https://twitch.tv/${update.user_login}`}
                    />
                  </div>
                  <div class="text-content">
                    {#if update.known_bot}
                      <span class="actor-icon" title="Performed by emote management bot">⚙️</span>
                    {:else if update.actor !== 'potatbotat'}
                      <span class="actor-icon" title="Performed on website">🌐</span>
                    {:else if update.expires_at && !update.is_expired}
                      <span class="actor-icon" title={`Temporary emote is set to expire after ${update.expires_at}`}>⏳</span>
                    {:else if update.expires_at && update.is_expired}
                      <span class="actor-icon" title={`Temporary emote has expired after ${update.expires_at}`}>💥</span>
                    {/if}

                    <a href={update.user_url} target="_blank" rel="noreferrer">
                      <strong class="font-bold" style={`color: ${update.user_color}`}>{update.user_name}</strong>
                    </a>
                    {update.method}
                    <SkeletonImage
                      class="inline-block max-h-10 !rounded-none"
                      src={update.emoteURL}
                      alt={`Emote ${update.emote_name}`}
                      title={`Emote ${update.emote_name}`}
                      href={update.emoteLink}
                    />
                    {update.emote_new_alias || update.emote_alias || update.emote_name}
                    {update.word} set
                    <a href={update.set_url} target="_blank" rel="noreferrer">
                      <em>"{resolvedSetNames[update.set_id] || update.set_name}"</em>
                    </a>
                  </div>
                </div>
                <div class="ago-container flex items-center justify-center">
                  <div class="text-content">
                    <span>{update.ago}</span>
                  </div>
                </div>
              </li>
            {/each}

            {#if isLoading}
              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each Array(5) as _, i (i)}
                <li class="emote-item flex gap-2 animate-pulse">
                  <div class="logo-container">
                    <Skeleton class="w-10 h-10 rounded-full" />
                  </div>
                  <div class="content-container flex items-center gap-2">
                    <Skeleton class="w-10 h-10 rounded-full" />
                    <Skeleton class="h-8 w-60 rounded" />
                  </div>
                  <div class="ago-container items-center justify-center">
                    <Skeleton class="w-20 h-6 rounded" />
                  </div>
                </li>
              {/each}
            {/if}
          </ul>

          {#if displayHistory.length === 0 && hasActiveFilter}
            <p class="py-6 text-center text-sm text-muted-foreground">No results match your filters.</p>
          {/if}
        </div>

        <!-- Sentinel triggers next-page fetch when scrolled into view -->
        <div bind:this={sentinel} class="h-2"></div>

        {#if !cursor && !isLoading && history.length > 0}
          <p class="pt-2 text-center text-xs text-muted-foreground">All {history.length} entries loaded.</p>
        {/if}

      {:else if none}
        <p class="text-muted-foreground text-sm py-4">
          No emote history found for <strong>{$page.params.login}</strong>.
          This channel may not have PotatBotat or may not have any tracked emote changes yet.
        </p>
      {:else}
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array(10) as _, i (i)}
          <li class="emote-item flex gap-2 animate-pulse">
            <div class="logo-container">
              <Skeleton class="w-10 h-10 rounded-full" />
            </div>
            <div class="content-container flex items-center gap-2">
              <Skeleton class="w-10 h-10 rounded-full" />
              <Skeleton class="h-8 w-60 rounded" />
            </div>
            <div class="ago-container items-center justify-center">
              <Skeleton class="w-20 h-6 rounded" />
            </div>
          </li>
        {/each}
      {/if}
  </fieldset>
</div>

<style scoped>
  #container {
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
  }

  .logo-container {
    display: flex;
    padding: 3px;
    border-radius: 0.5rem;
    background-color: hsl(var(--background));
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    margin-right: 10px;
    align-items: center;
  }

  .content-container {
    display: flex;
    padding: 3px;
    border-radius: 0.5rem;
    background-color: hsl(var(--background));
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    align-items: center;
    max-width: 700px;
    width: 100%;
  }

  .ago-container {
    display: flex;
    padding: 3px;
    border-radius: 0.5rem;
    background-color: hsl(var(--background));
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    margin-left: 10px;
    align-items: center;
    text-align: center;
    max-width: 135px;
    width: 100%;
  }

  .emote-list {
    list-style: none;
    padding: 0;
    overflow-y: auto;
    word-break: break-word;
  }

  .emote-item {
    display: flex;
    box-sizing: border-box;
    flex-wrap: nowrap;
  }

  .profile-picture {
    border-radius: 50%;
    margin-right: 5px;
    width: 40px;
    height: 40px;
    vertical-align: middle;
  }

  .emote-item .text-content {
    flex: 1;
    word-wrap: break-word;
  }

  .emote-item .text-content {
    vertical-align: middle;
  }

  .emote-item .text-content em {
    font-style: italic;
  }

  a:hover {
    text-decoration: underline;
  }

  .emote-list::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  .emote-list::-webkit-scrollbar-thumb {
    background: transparent;
  }
</style>
