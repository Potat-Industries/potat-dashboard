<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  import * as Avatar from "$lib/components/ui/avatar";
  // import { Separator } from "$lib/components/ui/separator";

  interface UserConnection {
    platform: string;
    username: string;
    id: string;
  }

  interface User {
    connections: UserConnection[];
  }

  const conns = [
    {
      description: 'By connecting your Anilist account, you allow PotatBotat to view your username and ID, view your watched anime, and update your lists.',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg',
      name: 'Anilist',
      color: '#02A9FF'
    },
    {
      description: 'When you choose to connect your Discord account, you allow PotatBotat to view your username and ID.',
      icon: 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg',
      name: 'Discord',
      color: '#5865F2'
    },
    {
      description: 'When you choose to connect your Spotify account, you allow PotatBotat to view your username and ID, view spotify listening history, and control playback.',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg',
      name: 'Spotify',
      color: '#1DB954'
    },
    {
      description: 'This connection is automatically linked based on your Twitch account.',
      icon: 'https://7tv.app/favicon.svg',
      name: '7TV',
      color: '#6441A4'
    }
  ]

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
    }
    
    if (!url) {
      // signOut();
      return;
    }
    openWindow(url);
  }

  const disconnect = async (platform: string): Promise<void> => {
    // placeholder;
    console.log('Disconnecting from', platform);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    userConnections = userConnections.filter(conn => conn.platform !== platform);
    toast.success('Disconnected', {
      duration: 2000,
      description: `Successfully disconnected from ${platform}`
    });
  }

  const loadConnections = async (): Promise<UserConnection[]> => {
    // mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user: User = {
      connections: [
        {
          platform: 'ANILIST',
          username: 'RyanPotat',
          id: '5y33g33t34f3',
        },
        {
          platform: 'DISCORD',
          username: 'RyanPotat',
          id: '37731234334547356',
        },
      ]
    }

    return user.connections;
  }

  $: userConnections = userConnections;

  onMount(async () => {
    const connections = await loadConnections();
    userConnections = [...connections];
  });
</script>

<form class="w-full max-w-3xl">
  <fieldset class="space-y-8 rounded-lg border p-6">
    <legend class="px-2 text-lg font-semibold">Connections</legend>

    {#each conns as platform (platform)}
      {#if userConnections.find(conn => conn.platform === platform.name?.toUpperCase())}
        <div class="flex items-center justify-between space-y-4">
          <div class="flex items-center space-x-4">
            <Avatar.Root class="h-12 w-12">
              <Avatar.Image src={platform.icon} alt={platform.name} />
            </Avatar.Root>
            <div>
              <p class="text-sm">{platform?.description}</p>
              <p class="text-sm">
                Connected as {userConnections.find(c => c.platform === platform.name.toUpperCase())?.username ?? 'Unknown'}
              </p>
            </div>
          </div>
          
          <Button
            style="background-color: #dc2626"
            on:click={() => disconnect(platform.name.toUpperCase())}
            class="w-full md:w-auto px-4 py-3 text-lg text-white"
          >
            <span>Disconnect</span>
          </Button>
        </div>
      {:else}
        <div class="flex items-center justify-between space-y-4">
          <div class="flex items-center space-x-4">
            <Avatar.Root class="h-12 w-12">
              <Avatar.Image src={platform.icon} alt={platform.name} />
            </Avatar.Root>
            <p class="text-sm">{platform?.description}</p>
            <p></p>
          </div>
          
          <Button
            style="background-color: #16a34a"
            on:click={() => connect(platform.name.toUpperCase())}
            class="w-full md:w-auto px-4 py-3 text-lg"
          >
            <span>Connect</span>
          </Button>
        </div>
      {/if}
      <!-- <Separator /> -->
    {/each}
  </fieldset>
</form>

<style>

</style>

