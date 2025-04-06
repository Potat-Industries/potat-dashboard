<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { fetchBackend } from '$lib/utils';
  import { browser } from '$app/environment';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import SkeletonImage from '$lib/components/skeleton-image/+skeleton-image.svelte';

  interface EmoteHistoryEntry {
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

  interface ComputedExtras extends EmoteHistoryEntry {
    readonly user_url: string;
    readonly set_url: string;
    readonly method: string;
    readonly word: string;
    readonly expiry: string | null;
  }

  interface SimpleChannel {
    readonly pfp: string;
    readonly bestName: string;
    readonly login: string;
    readonly name: string;
  }

  interface HistoryResponse {
    readonly channel: SimpleChannel;
    readonly history: EmoteHistoryEntry[];
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

  let observer: IntersectionObserver;
  let loaded = $state(false);
  let isLoading = $state(false);
  let none = $state(false);
  let history: ComputedExtras[] = $state([]);
  let cursor: string | null = $state(null);
  const loadedEmotes = $state(new Map());
  let channel: SimpleChannel = $state({
    pfp: '',
    bestName: '',
    login: '',
    name: '',
  });

  async function fetchEmoteHistory(pagination?: string | null) {
    if (isLoading) {
      return;
    }

    isLoading = true;
    try {
      const response = await fetchBackend<HistoryResponse>(`emotes/history/${$page.params.login}`, {
        params: { limit: 50, after: pagination },
      });

      const data = response?.data[0];
      if (!data && history.length === 0) {
        none = true;

        return;
      }

      if (response.pagination?.hasNextPage) {
        cursor = response?.pagination?.cursor;
      }

      channel = data.channel;

      const computedHistory = data.history.map(update => {
        let userPfp = update.user_stv_pfp || update.user_pfp;
        let user_url = '';
        let set_url = '';
        let method = '';
        let word = '';
        let expiry = null;
        let expired = null;

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

        if (update.provider === '7TV' || update.provider === 'STV') {
          user_url = `https://7tv.app/users/${update.user_stv_id}`;
          set_url = `https://7tv.app/emote-sets/${update.set_id}`;
        } else if (update.provider === 'BTTV') {
          user_url = `https://betterttv.com/users/${update.user_bttv_id}`;
          set_url = `https://betterttv.com/users/${update.set_id}`;
        } else if (update.provider === 'FFZ') {
          user_url = `https://www.frankerfacez.com/channel/${update.user_login}`;
          set_url = `https://www.frankerfacez.com/channel/${channel.login}`;
        }

        if (update.expires_at) {
          expiry = update.expires_at;
          expired = update.is_expired ?? false;
        }

        return {
          ...update,
          user_pfp: userPfp,
          user_url,
          set_url,
          method,
          word,
          expiry,
          expired,
        };
      });

      for (const update of computedHistory) {
        if (!update) continue;
        const key = `${update.emote_id}:${update.ago}:${update.action}:${update.user_login}`;
        if (!loadedEmotes.get(key)) {
          history.push(update);
          loadedEmotes.set(key, update);
        }
      }
    } catch (err) {
      console.error('Failed to fetch emote history:', err);
    } finally {
      loaded = true;
      isLoading = false;
    }
  }

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      if (!cursor) return;
      fetchEmoteHistory(cursor);
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

  onMount(() => {
    fetchEmoteHistory();
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
  <form class="w-full max-w-5xl p-10">
    <fieldset class="space-y-8 rounded-lg border p-6" style="box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3)">
      <legend class="px-2 text-xl font-semibold">Emote Actions In {$page.params.login}</legend>
        {#if loaded && !none}
        <div id="container">
          <ul class="emote-list">
            {#each history as update (update.emote_id + update.ago + update.action + update.user_login)}
              <li class="emote-item flex gap-2">
                <div class="logo-container">
                  <SkeletonImage
                    class="h-10 max-h-10 max-w-10 rounded-full aspect-square"
                    src={providers[update.provider].logo}
                    alt={`${providers[update.provider].name} logo`}
                    title={providers[update.provider].name}
                    href={providers[update.provider].home}
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

                    <a href={update.user_url} target="_blank">
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
                    <a href={update.set_url} target="_blank">
                      <em>"{update.set_name}"</em>
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

            {#if isLoading }
              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each Array(10) as _, i (i)}
                <li class="emote-item flex gap-2 animate-pulse">
                  <div class="logo-container">
                    <Skeleton class="w-10 h-10 rounded-full" />
                  </div>
                  <div class="content-container flex items-center gap-2">
                    <Skeleton class="w-10 h-10 rounded-full" />
                    <div class="flex flex-col gap-1">
                      <Skeleton class="block h-8 w-60! align-middle !rounded-none" />
                    </div>
                  </div>
                  <div class="ago-container items-center justify-center">
                    <Skeleton class="w-20 h-6 rounded" />
                  </div>
                </li>
              {/each}
            {/if}
          </ul>
        </div>
      {:else}
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array(10) as _, i (i)}
          <li class="emote-item flex gap-2 animate-pulse">
            <div class="logo-container">
              <Skeleton class="w-10 h-10 rounded-full" />
            </div>
            <div class="content-container flex items-center gap-2">
              <Skeleton class="w-10 h-10 rounded-full" />
              <div class="flex flex-col gap-1">
                <Skeleton class="block h-8 w-60! align-middle !rounded-none" />
              </div>
            </div>
            <div class="ago-container items-center justify-center">
              <Skeleton class="w-20 h-6 rounded" />
            </div>
          </li>
        {/each}
      {/if}
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
