<script lang="ts">
  import { browser } from '$app/environment';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button/index.js';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import { env } from '$env/dynamic/public';
  import { onMount, onDestroy } from 'svelte';
  import { toast } from 'svelte-sonner';

  type LoginPayload = {
    id: string;
    login: string;
    name: string;
    stv_id?: string | null;
    is_channel?: boolean;
    pfp?: string | null;
  };

  const DEFAULT_LOGIN_URL = 'https://api.potat.app/login';

  let { open = $bindable(), empty = false } = $props();
  let loginWindow: Window | null = null;

  const isLoginPayload = (value: unknown): value is LoginPayload => {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const payload = value as Record<string, unknown>;
    return typeof payload.id === 'string' && typeof payload.login === 'string';
  };

  const resolveLoginUrl = (): string => {
    const rawUrl = env.PUBLIC_LOGIN_URL ?? DEFAULT_LOGIN_URL;

    if (!browser) {
      return rawUrl;
    }

    try {
      return new URL(rawUrl, window.location.origin).href;
    } catch {
      return DEFAULT_LOGIN_URL;
    }
  };

  const resolveLoginOrigin = (): string => {
    if (!browser) {
      return new URL(DEFAULT_LOGIN_URL).origin;
    }

    try {
      return new URL(resolveLoginUrl()).origin;
    } catch {
      return new URL(DEFAULT_LOGIN_URL).origin;
    }
  };

  const onLogin = (): void => {
    if (!browser) {
      return;
    }

    const loginUrl = resolveLoginUrl();
    loginWindow = window.open(loginUrl, 'potat-login', 'width=600,height=800');

    if (!loginWindow) {
      toast.error('Popup blocked', {
        description: 'Please allow popups for this site and try again.',
        duration: 5000,
      });
    }
  };

  const handleMessage = (event: MessageEvent<unknown>): void => {
    if (event.origin !== resolveLoginOrigin()) {
      return;
    }

    if (!isLoginPayload(event.data)) {
      return;
    }

    const { id, login, name, stv_id, is_channel, pfp } = event.data;

    userState.set({
      id,
      login,
      name,
      stv_id: stv_id ?? '',
      is_channel: Boolean(is_channel),
      pfp: pfp ?? undefined,
    });

    if (!pfp) {
      fetch(`https://api.potat.app/users/${login}`)
        .then(r => r.json())
        .then(res => {
          const connections: { platform: string; pfp?: string }[] = res?.data?.[0]?.user?.connections ?? [];
          const twitchConn = connections.find(c => c.platform === 'TWITCH');
          if (twitchConn?.pfp) {
            userState.update(s => s ? { ...s, pfp: twitchConn.pfp } : s);
          }
        })
        .catch(() => {/* non-fatal */});
    }

    open = false;

    if (loginWindow && !loginWindow.closed) {
      loginWindow.close();
    }
    loginWindow = null;
  };

  onMount((): void => {
    if (!browser) {
      return;
    }

    window.addEventListener('message', handleMessage);
  });

  onDestroy((): void => {
    if (!browser) {
      return;
    }

    window.removeEventListener('message', handleMessage);

    if (loginWindow && !loginWindow.closed) {
      loginWindow.close();
    }
  });
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Trigger>
    {#if !empty}
      <Button variant="outline" size="default">Login</Button>
    {/if}
  </AlertDialog.Trigger>

  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Sign in to PotatBotat</AlertDialog.Title>
      <AlertDialog.Description>
        By signing in, you agree to our
        <a href="/dashboard/privacy-policy">Privacy Policy</a>
        and <a href="/dashboard/terms">Terms of Service</a>.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={onLogin}>Sign in with Twitch</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
  a {
    color: hsl(var(--primary));
    text-decoration: none;
    white-space: nowrap;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
