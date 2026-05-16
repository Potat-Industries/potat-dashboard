<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ConnectionItem from './connectionItem.svelte';
  import { conns } from './connections';
  import { userState, userToken } from '$lib/store/LocalStorage.svelte';
  import { fetchBackend } from '$lib/utils';
  import { env } from '$env/dynamic/public';

  interface UserConnection {
    platform: string;
    username: string;
    id: string;
  }

  let userConnections: UserConnection[] = $state([]);

  const apiBase = env.PUBLIC_API_BASE_URL ?? 'https://api.potat.app';

  const openWindow = (url: string): void => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      setTimeout(() => window.open(url, '_top'), 0);
    } else {
      window.open(url, '_blank', 'width=600,height=800');
    }
  };

  const connect = async (platform: string): Promise<void> => {
    const prettyPlatform = platform.charAt(0) + platform.slice(1).toLowerCase();

    if (platform === '7TV' || platform === 'BTTV') {
      toast.info(`${prettyPlatform} is linked automatically from your Twitch account.`);
      return;
    }

    if (platform === 'FFZ') {
      openWindow(`${apiBase}/auth/ffz/authorize`);
      return;
    }

    try {
      const res = await fetchBackend<string>(`auth/${platform.toLowerCase()}/authorize`, {
        auth: true,
      });

      if (res.errors?.length || !res.data?.[0]) {
        toast.error('Error', {
          duration: 5000,
          description: `Failed to get authorization URL for ${prettyPlatform}`,
        });
        return;
      }

      openWindow(res.data[0]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Error', {
          duration: 5000,
          description: `Failed to connect to ${prettyPlatform}: ${error.message}`,
        });
      }
    }
  };

  const disconnect = async (platform: string): Promise<void> => {
    try {
      console.log('Disconnecting from', platform);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      userConnections = userConnections.filter(conn => conn.platform !== platform);
      toast.success('Disconnected', {
        duration: 2000,
        description: `Successfully disconnected from ${platform}`,
      });
    } finally {
    }
  };

  const refresh = async (platform: string): Promise<void> => {
    if (platform === '7TV' || platform === 'BTTV' || platform === 'FFZ') {
      const connections = await loadConnections();
      userConnections = [...connections];
      toast.success('Refreshed', { duration: 2000, description: `${platform} connection refreshed` });
      return;
    }

    toast.info('Refresh not available for this platform.');
  };

  const loadConnections = async (): Promise<UserConnection[]> => {
    const login = $userState?.login;
    const token = $userToken;
    if (!login) return [];

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const connections = await fetch(`${apiBase}/users/${login}`, {
      method: 'GET',
      headers,
    }).then(res => res.json()).then(res => {
      return res.data[0]?.user?.connections ?? [];
    });

    return connections;
  };

  const findConn = (platform: string): UserConnection | undefined => {
    if (platform === '7TV') {
      platform = 'STV';
    }
    return userConnections.find(conn => conn.platform === platform);
  };

  onMount(async () => {
    const connections = await loadConnections();
    userConnections = [...connections];
  });
</script>

<div class="flex justify-center px-4">
  <fieldset class="w-full max-w-3xl space-y-8 rounded-lg border p-6">
    <legend class="px-2 text-lg font-semibold">Connections</legend>
      {#each conns as platform}
        <ConnectionItem
          {platform}
          userConnection={findConn(platform.name.toUpperCase())}
          {connect}
          {disconnect}
          {refresh}
        />
      {/each}
  </fieldset>
</div>

<style>

</style>
