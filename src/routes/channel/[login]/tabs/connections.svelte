<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ConnectionItem from './connectionItem.svelte';
  import { conns } from './connections';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import {
    getUserConnections,
    getAuthUrl,
    disconnectPlatform,
    type UserConnection,
  } from '$lib/api/users';

  let userConnections: UserConnection[] = $state([]);
  let pendingDisconnect: string | null = $state(null);
  let disconnecting = $state(false);

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

    try {
      const url = await getAuthUrl(platform);
      openWindow(url);
    } catch (e) {
      toast.error('Error', {
        duration: 5000,
        description: `Failed to connect to ${prettyPlatform}: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  };

  const disconnect = (platform: string): void => {
    pendingDisconnect = platform;
  };

  const confirmDisconnect = async (): Promise<void> => {
    const platform = pendingDisconnect;
    if (!platform) return;
    disconnecting = true;
    try {
      await disconnectPlatform(platform);
      userConnections = userConnections.filter(conn => conn.platform !== platform);
      toast.success('Disconnected', {
        duration: 2000,
        description: `Successfully disconnected from ${platform}`,
      });
    } catch (e) {
      toast.error('Error', {
        duration: 5000,
        description: `Failed to disconnect from ${platform}: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      disconnecting = false;
      pendingDisconnect = null;
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
    if (!login) return [];
    return getUserConnections(login);
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

<AlertDialog.Root open={pendingDisconnect !== null} onOpenChange={(o) => { if (!o) pendingDisconnect = null; }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Disconnect {pendingDisconnect}?</AlertDialog.Title>
      <AlertDialog.Description>
        This will unlink your {pendingDisconnect} account from PotatBotat. You can reconnect at any time.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        on:click={confirmDisconnect}
        disabled={disconnecting}
      >
        {disconnecting ? 'Disconnecting…' : 'Disconnect'}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

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
