<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ConnectionItem from './connectionItem.svelte';
  import { conns } from './connections';
  // import { Separator } from "$lib/components/ui/separator";

  interface UserConnection {
    platform: string;
    username: string;
    id: string;
  }

  let userConnections: UserConnection[] = [];
  
  // let authorizationToken: string | null = localStorage.getItem('authorization');
  // let userState: string | null = localStorage.getItem('userState');

  // $: isAuthenticated = authorizationToken !== null || userState !== null;

  const openWindow = (url: string): void => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      setTimeout(() => window.open(url, '_top'), 0);
    } else {
      window.open(url, '_blank', 'width=600,height=800');
    }
  }

  // function signOut(): void {
  //   localStorage.clear();
  //   userState = null;
  //   authorizationToken = null;
  // }

  const connect = async (platform: string): Promise<void> => {
    const prettyPlatform = platform.charAt(0) + platform.slice(1).toLowerCase();
    
    let url: string | undefined;
    try {
      // const res = await fetchBackend(`auth/${platform.toLowerCase()}/authorize`, { auth: true });
      // url = res.data?.[0];
      url = 'https://google.com';
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        toast.error('Error', {
          duration: 5000,
          description: `Failed to connect to ${prettyPlatform}: ${error.message}`
        })
      }
    } finally {
      // stop spinner
    }
    
    if (!url) {
      // signOut();
      return;
    }
    openWindow(url);
  }

  const disconnect = async (platform: string): Promise<void> => {
    try {
      // placeholder;
      console.log('Disconnecting from', platform);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      userConnections = userConnections.filter(conn => conn.platform !== platform);
      toast.success('Disconnected', {
        duration: 2000,
        description: `Successfully disconnected from ${platform}`
      });
    } finally {
      // stop spinner
    }
  }

  const refresh = async (platform: string): Promise<void> => {
    try {
      // placeholder;
      console.log('Refreshing', platform);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Refreshed', {
        duration: 2000,
        description: `Successfully refreshed ${platform}`
      });
    } finally {
      // stop spinner
    }
  }

  const loadConnections = async (): Promise<UserConnection[]> => {
    const connections = await fetch(`https://api.potat.app/users/ryanpotat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(res=> {
      console.log(res); return res.data[0]?.user?.connections ?? []
    });

    console.log(connections);

    return connections;
  }

  const findConn = (platform: string): UserConnection | undefined => {
    if (platform === '7TV') {
      platform = 'STV';
    }
    return userConnections.find(conn => conn.platform === platform);
  }

  $: userConnections = userConnections;

  onMount(async () => {
    const connections = await loadConnections();
    userConnections = [...connections];
  });
</script>

<div class="flex justify-center">
  <form class="w-full max-w-3xl shadow-lg rounded-lg" style="padding-left: 20px; padding-right: 20px;">
    <fieldset class="space-y-8 rounded-lg border p-6">
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
  </form>
</div>

<style>

</style>

