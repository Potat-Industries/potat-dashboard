<script lang="ts">
  import type { EmoteMetricUse } from '$lib/types';
  import { fetchBackend } from '$lib/utils';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
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

  let observer: IntersectionObserver;
  let isLoading = $state(false);
  let order = $state<Selected<Order>>({ value: 'desc' });
  let period = $state<Selected<Period>>({ value: 'all' });
  let selectedProvider = $state<Selected<string>>({ value: 'all' });
  let history: EmoteMetricUse[] = $state([]);
  let cursor: string | null = $state(null);

  const loadedEmotes = $state(new Map());

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

  const fetchEmoteStats = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    isLoading = true;

    try {
      const response = await fetchBackend<EmoteMetricUse>('emotes/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          login: $page.params.login,
          order: order.value,
          period: period.value,
          provider: selectedProvider.value,
          after: cursor,
        },
      });

      for (const update of response.data) {
        if (!update) {
          continue;
        }
        const key = `${update.emote_id}:${update.emote_name}:${update.provider}`;
        if (!loadedEmotes.get(key)) {
          history.push(update);
          loadedEmotes.set(key, update);
        }
      }

      cursor = response.pagination?.cursor || null;
    } catch (error) {
      console.error('Error fetching emote stats:', error);
    } finally {
      isLoading = false;
    }
  };

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      if (!cursor) {
        return;
      }
      fetchEmoteStats();
    }
  };

  const observeImages = () => {
    const options = { rootMargin: '0px', threshold: 0.1 };
    observer = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          observer.unobserve(img);
        }
      }
    }, options);

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  };

  const resetAndFetch = () => {
    history = [];
    loadedEmotes.clear();
    cursor = null;
    fetchEmoteStats();
  };

  onMount(() => {
    fetchEmoteStats();
    if (browser) {
      observeImages();
      addEventListener('scroll', handleScroll);
    }
  });

  onDestroy(() => {
    if (browser) {
      removeEventListener('scroll', handleScroll);
    }
  });
</script>

<div class="flex justify-center">
  <form class="max-w-5xl p-10">
    <fieldset class="space-y-8 rounded-lg border px-6" style="box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3)">
      <legend class="px-2 text-xl font-semibold">Emote Stats In {$page.params.login}</legend>

      <div class="flex justify-between items-center gap-2 mb-4">
        <div class="w-1/3">
          <Select.Root
            bind:selected={period}
            onSelectedChange={(selected) => {
              period = { value: selected?.value as Period };
              resetAndFetch();
            }}
          >
            <Select.Trigger class="w-full h-9 px-3 py-1">
              <Select.Value placeholder="Time Period" />
            </Select.Trigger>
            <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
              {#each periods as periodOption}
                <Select.Item value={periodOption.value}>{periodOption.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="w-1/3">
          <Select.Root
            bind:selected={order}
            onSelectedChange={(selected) => {
              order = { value: selected?.value as Order };
              resetAndFetch();
            }}
          >
            <Select.Trigger class="w-full h-9 px-3 py-1">
              <Select.Value placeholder="Sort Order" />
            </Select.Trigger>
            <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
              {#each orders as orderOption}
                <Select.Item value={orderOption.value}>{orderOption.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="w-1/3">
          <Select.Root
            bind:selected={selectedProvider}
            onSelectedChange={(selected) => {
              selectedProvider = { value: selected?.value as string };
              resetAndFetch();
            }}
          >
            <Select.Trigger class="w-full h-9 px-3 py-1">
              <Select.Value placeholder="Provider" />
            </Select.Trigger>
            <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
              <Select.Item value={'all'}>All Providers</Select.Item>
              <Select.Separator class="border-t my-1" />
              {#each providerOptions as providerOption}
                <Select.Item value={providerOption.value}>{providerOption.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div id="container">
        <ul class="emote-list">
          {#each history as update (update.emote_id + update.provider + update.count)}
            <li class="emote-item flex gap-2">
              {#if selectedProvider.value === 'all'}
                <div class="logo-container">
                  <SkeletonImage
                    class="h-10 max-h-10 max-w-10 {update.provider === 'TWITCH' ? 'rounded-none' : 'rounded-full'} aspect-square"
                    src={providers?.[update.provider]?.logo || `/dashboard/${update.provider.toLowerCase()}-logo.png`}
                    alt={`${update.provider} logo`}
                    title={providers[update.provider]?.name || update.provider}
                    href={providers?.[update.provider]?.home || '#'}
                  />
                </div>
              {/if}
              <div class="content-container flex items-center gap-2">
                {#if update.provider !== 'EMOJI'}
                  <div class="emote-image flex items-center">
                    <SkeletonImage
                      class="h-10 w-auto max-w-none"
                      src={update.url}
                      alt={`Emote ${update.emote_name}`}
                      href={update.url}
                      title={`Emote ${update.emote_name}`}
                    />
                  </div>
                {:else}
                  <div class="emote-image flex items-center" style="font-size: 2rem;">
                    {String.fromCodePoint(parseInt(update.emote_id, 16))}
                  </div>
                {/if}
                <div class="text-content">
                  <strong class="font-bold">{update.provider === 'EMOJI' ? update.emote_name : update.emote_alias || update.emote_name}</strong>
                  {#if
                    update.emote_alias &&
                    update.emote_alias !== update.emote_name &&
                    update.provider !== 'EMOJI'
                  }
                    <span class="text-muted-foreground text-sm">({update.emote_name})</span>
                  {/if}
                </div>
              </div>
              <div class="ago-container flex items-center justify-center">
                <div class="text-content">
                  <span class="text-lg font-bold">{parseInt(update.count).toLocaleString()}</span>
                  <span class="text-sm text-muted-foreground">uses</span>
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
                  <Skeleton class="h-10 w-10" />
                  <div class="flex flex-col gap-1">
                    <Skeleton class="h-4 w-24 rounded" />
                  </div>
                </div>
                <div class="ago-container items-center justify-center">
                  <Skeleton class="w-12 h-6 rounded" />
                </div>
              </li>
            {/each}
          {/if}
        </ul>
      </div>
    </fieldset>
  </form>
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
    min-width: 400px;
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
    min-width: 200px;
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

  .emote-item .text-content {
    flex: 1;
    word-wrap: break-word;
  }

  .emote-item .text-content {
    vertical-align: middle;
  }

  .emote-list::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  .emote-list::-webkit-scrollbar-thumb {
    background: transparent;
  }

  .emote-image {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
  }
</style>
