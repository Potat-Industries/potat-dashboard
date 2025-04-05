<script lang="ts">
  import Dropdown from '$lib/components/user-dropdown/user-dropdown.svelte';
  import { CircleAlert, X } from "lucide-svelte";
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Alert from "$lib/components/ui/alert";
  // TODO: $types?
  import type { ChannelPartial } from '../../../routes/+layout';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import LoginPopup from '../login-popup/+login-popup.svelte';
  import { goto } from '$app/navigation';
  
  let { channels }: { channels: ChannelPartial[] } = $props();
  
  let show = $state(true);
  let searchQuery: string = $state('');
  let openPopup = $state(false);
  
  let filteredChannels: ChannelPartial[] = $derived(
    channels
      .filter(channel => channel.username.startsWith(searchQuery.toLowerCase()))
      .slice(0, 5) ?? []
  );
  // let selectedIndex = $state(-1);

  const selectChannel = (channel: string): void => {
    searchQuery = '';
    const path = `/dashboard/channel/${channel}`;
    window.location.href = path;
  };

  const handleClickington = (): void => {
    if (!$userState?.login) {
      openPopup = true;
    }
  };

  const handleEnterPress = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || !searchQuery) {
      // do nothing
      return;
    }
    const userLogin = searchQuery;
    searchQuery = '';

    goto(`/dashboard/channel/${userLogin}`);
  };
</script>

<nav>
  <div class="left-section">
    <Button variant="outline">
      <a href="/dashboard/">PotatBotat</a>
    </Button>
    <Button variant="outline" onclick={handleClickington}>
      {#if $userState?.login}
        <a href="/dashboard/channel/{$userState?.login ?? ''}">My Channel</a>
      {:else}
        My channel
      {/if}
    </Button>
  </div>
  <div class="search-container">
    <Input
      bind:value={searchQuery}
      placeholder="Search Channels..."
      maxlength={25}
      on:keydown={handleEnterPress}
    />

    {#if searchQuery && filteredChannels.length > 0}
      <ul class="search-results rounded-md">
        {#each filteredChannels as channel}
          <div>
            <Button
              variant="ghost"
              style="width: 100%; justify-content: left;"
              on:click={() => selectChannel(channel.username)}
            >
            {channel.username}
            </Button>
          </div>
        {/each}
      </ul>
    {/if}
  </div>
  <div class="right-section">
    <Dropdown />
  </div>
</nav>

{#if show}
  <Alert.Root 
    variant="warning" 
    class="relative items-center justify-between p-4"
  >
    <CircleAlert class="h-4 w-4" />
    <Alert.Description>
      This website is currently in beta and nothing is functional. Stay tuned for poggers happy funtime features!
    </Alert.Description>
    <Button 
      variant="ghost"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-900 dark:text-yellow-100 hover:opacity-70"
      on:click={() => (show = false)}
    >
      <X class="w-4 h-4" />
    </Button>
  </Alert.Root>
{/if}

{#if openPopup}
  <LoginPopup bind:open={openPopup} empty={true} />
{/if}

<style>
  nav {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: hsla(var(--background), 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid hsl(var(--border));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1000;
  }

  .left-section, .right-section {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  a {
    color: hsl(var(--foreground));
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  a:hover {
    color: hsl(var(--primary));
  }

  .search-container {
    position: relative;
    min-width: 200px;
  }

  .search-results {
    position: absolute;
    background: hsla(var(--background));
    border: 1px solid hsl(var(--border));
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 210px;
    width: 100%;
    margin-top: 10px;

    overflow-y: auto;
    z-index: 9999;
    padding: 0;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 400px) {
    nav {
      flex-direction: column;
      gap: 10px;
      padding: 10px;
    }

    .left-section {
      justify-content: center;
      margin-bottom: 10px;
    }

    .right-section {
      justify-content: center;
    }
  }
</style>
