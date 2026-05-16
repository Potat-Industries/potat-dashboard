<script lang="ts">
  import type { EmoteMetricUse } from '$lib/types';
  import { fetchBackend } from '$lib/utils';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import SkeletonImage from '$lib/components/skeleton-image/+skeleton-image.svelte';
  import * as Select from '$lib/components/ui/select/index.js';
  import type { Selected } from 'bits-ui';

  interface ProviderInfo {
    logo: string;
    home: string;
    name: string;
  }

  type Period = 'hour' | 'day' | 'week' | 'month' | 'all';
  type Order = 'asc' | 'desc';

  const providers: Record<string, ProviderInfo> = {
    TWITCH: {
      logo: '/dashboard/twitch-logo.png',
      home: 'https://twitch.tv/',
      name: 'Twitch',
    },
    EMOJI: {
      logo: '/dashboard/emoji-logo.png',
      home: 'https://emojipedia.org/',
      name: 'Emoji',
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

  let isLoading = $state(false);
  let loaded = $state(false);
  let order = $state<Selected<Order>>({ value: 'desc' });
  let period = $state<Selected<Period>>({ value: 'all' });
  let selectedProvider = $state<Selected<string>>({ value: 'all' });
  let history: EmoteMetricUse[] = $state([]);
  let cursor: string | null = $state(null);

  const seenKeys = new Map<string, true>();

  const periods = [
    { value: 'hour', label: 'Last Hour' },
    { value: 'day', label: 'Last Day' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
  ];

  const orders = [
    { value: 'desc', label: 'Most Used' },
    { value: 'asc', label: 'Least Used' },
  ];

  const providerOptions = Object.entries(providers).map(([key, provider]) => ({
    value: key,
    label: provider.name,
  }));

  let sentinel = $state<HTMLDivElement | undefined>(undefined);

  const fetchEmoteStats = async (): Promise<void> => {
    if (isLoading) return;
    isLoading = true;
    try {
      const response = await fetchBackend<EmoteMetricUse>('emotes/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        params: {
          login: $page.params.login,
          order: order.value,
          period: period.value,
          provider: selectedProvider.value,
          after: cursor,
        },
      });

      for (const update of response.data) {
        if (!update) continue;
        const key = `${update.emote_id}:${update.emote_name}:${update.provider}`;
        if (!seenKeys.has(key)) {
          history.push(update);
          seenKeys.set(key, true);
        }
      }

      cursor = response.pagination?.hasNextPage ? (response.pagination.cursor ?? null) : null;
    } catch (error) {
      console.error('Error fetching emote stats:', error);
    } finally {
      loaded = true;
      isLoading = false;
    }
  };

  const resetAndFetch = () => {
    history = [];
    seenKeys.clear();
    cursor = null;
    loaded = false;
    fetchEmoteStats();
  };

  $effect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && cursor) fetchEmoteStats();
      },
      { rootMargin: '400px' }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  });

  onMount(() => { fetchEmoteStats(); });
</script>

<div class="flex justify-center px-4 py-6">
  <fieldset class="w-full max-w-3xl space-y-4 rounded-lg border p-6">
    <legend class="px-2 text-xl font-semibold">Emote Stats In {$page.params.login}</legend>

    <!-- Controls -->
    <div class="flex flex-wrap gap-2 border-b border-border pb-3">
      <Select.Root
        bind:selected={period}
        onSelectedChange={(selected) => {
          period = { value: selected?.value as Period };
          resetAndFetch();
        }}
      >
        <Select.Trigger class="h-8 flex-1 min-w-[120px] px-3 py-1 text-sm">
          <Select.Value placeholder="Time Period" />
        </Select.Trigger>
        <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
          {#each periods as p}
            <Select.Item value={p.value}>{p.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root
        bind:selected={order}
        onSelectedChange={(selected) => {
          order = { value: selected?.value as Order };
          resetAndFetch();
        }}
      >
        <Select.Trigger class="h-8 flex-1 min-w-[120px] px-3 py-1 text-sm">
          <Select.Value placeholder="Sort Order" />
        </Select.Trigger>
        <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
          {#each orders as o}
            <Select.Item value={o.value}>{o.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root
        bind:selected={selectedProvider}
        onSelectedChange={(selected) => {
          selectedProvider = { value: selected?.value as string };
          resetAndFetch();
        }}
      >
        <Select.Trigger class="h-8 flex-1 min-w-[120px] px-3 py-1 text-sm">
          <Select.Value placeholder="Provider" />
        </Select.Trigger>
        <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
          <Select.Item value={'all'}>All Providers</Select.Item>
          <Select.Separator class="border-t my-1" />
          {#each providerOptions as prov}
            <Select.Item value={prov.value}>{prov.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <!-- List -->
    <ul class="space-y-1.5">
      {#each history as update, i (update.emote_id + update.provider + update.count)}
        <li class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
          <!-- rank -->
          <span class="w-7 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{i + 1}</span>

          <!-- provider logo (only when showing all providers) -->
          {#if selectedProvider.value === 'all'}
            <SkeletonImage
              class="size-5 shrink-0 {update.provider === 'TWITCH' ? 'rounded-none' : 'rounded-full'}"
              src={providers?.[update.provider]?.logo ?? `/dashboard/${update.provider.toLowerCase()}-logo.png`}
              alt={providers?.[update.provider]?.name ?? update.provider}
              title={providers?.[update.provider]?.name ?? update.provider}
              href={providers?.[update.provider]?.home ?? '#'}
            />
          {/if}

          <!-- emote image -->
          <div class="flex h-10 min-w-[40px] max-w-[80px] shrink-0 items-center justify-center overflow-hidden">
            {#if update.provider !== 'EMOJI'}
              <SkeletonImage
                class="max-h-10 w-auto max-w-full"
                src={update.url}
                alt={update.emote_alias || update.emote_name}
                title={update.emote_alias || update.emote_name}
                href={update.url}
              />
            {:else}
              <span style="font-size: 2rem; line-height:1;">{String.fromCodePoint(parseInt(update.emote_id, 16))}</span>
            {/if}
          </div>

          <!-- name -->
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-medium">
              {update.provider === 'EMOJI' ? update.emote_name : (update.emote_alias || update.emote_name)}
            </span>
            {#if update.emote_alias && update.emote_alias !== update.emote_name && update.provider !== 'EMOJI'}
              <span class="truncate text-xs text-muted-foreground">{update.emote_name}</span>
            {/if}
          </div>

          <!-- count -->
          <div class="shrink-0 text-right">
            <span class="font-bold tabular-nums">{parseInt(update.count).toLocaleString()}</span>
            <span class="ml-1 text-xs text-muted-foreground">uses</span>
          </div>
        </li>
      {/each}

      {#if isLoading}
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array(loaded ? 5 : 10) as _, i (i)}
          <li class="flex animate-pulse items-center gap-3 rounded-md border bg-card px-3 py-2">
            <Skeleton class="h-5 w-7 rounded" />
            <Skeleton class="size-10 rounded-full" />
            <Skeleton class="h-10 w-10 rounded" />
            <div class="flex flex-1 flex-col gap-1">
              <Skeleton class="h-4 w-28 rounded" />
            </div>
            <Skeleton class="h-5 w-16 rounded" />
          </li>
        {/each}
      {/if}
    </ul>

    <!-- sentinel for IntersectionObserver pagination -->
    {#if loaded}
      <div bind:this={sentinel} class="h-2"></div>
      {#if !cursor && !isLoading && history.length > 0}
        <p class="pt-1 text-center text-xs text-muted-foreground">All {history.length} emotes loaded.</p>
      {/if}
    {/if}
  </fieldset>
</div>
