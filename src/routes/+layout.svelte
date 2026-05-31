<script lang="ts">
  import Nav from '$lib/components/nav/+top-bar.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from 'svelte-sonner';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { userState, type UserState } from '$lib/store/LocalStorage.svelte';
  import '/src/app.css';

	let { data, children } = $props();

  onMount(async () => {
    if (!browser) return;

    try {
      const res = await fetch(
        `${env.PUBLIC_API_BASE_URL ?? 'https://api.potat.app'}/me`,
        { credentials: 'include' }
      );

      if (res.status === 401) {
        userState.set(null);
        return;
      }

      if (!res.ok) return;

      const body = await res.json().catch(() => null);
      const me = body?.data?.[0] ?? body?.data ?? body;
      if (!me || typeof me !== 'object') return;

      const next: UserState = {
        id: String(me.id ?? ''),
        login: String(me.login ?? ''),
        name: String(me.name ?? me.login ?? ''),
        stv_id: String(me.stv_id ?? ''),
        is_channel: Boolean(me.is_channel),
        pfp: me.pfp ?? undefined,
      };

      if (next.id && next.login) {
        userState.set(next);
      }
    } catch {
      // network error: keep cached state
    }
  });
</script>

<ModeWatcher />

<div class="bg-image">
</div>

<header>
  <Nav channels={data.channels}/>
</header>

{@render children()}

<footer>
  <Toaster
    theme={'dark'}
    richColors
    class="[&>div]:font-sans [&>div]:text-base [&>div]:shadow-lg"
    toastOptions={{
      classes: {
        toast: 'bg-background text-foreground',
        title: 'text-lg font-semibold',
        description: 'text-muted-foreground',
        closeButton: 'bg-background text-foreground',
      },
    }}
  />
</footer>

<style>
  .bg-image {
    background: linear-gradient(
      rgba(var(--bbackground), 0.9),
      rgba(var(--bbackground), 0.9)
    ), url('/home-low-quality.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh;

    /* Add Blur Effect */
    filter: blur(8px);
    -webkit-filter: blur(8px);

    position: fixed;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  header {
    position: sticky;
    z-index: 2;
    top: 0;
    background: rgba(var(--bbackground), 0.5);
  }
</style>
