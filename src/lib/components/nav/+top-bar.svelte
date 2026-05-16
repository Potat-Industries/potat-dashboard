<script lang="ts">
  import Dropdown from '$lib/components/user-dropdown/user-dropdown.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  // TODO: $types?
  import type { ChannelPartial } from '../../../routes/+layout';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import LoginPopup from '../login-popup/+login-popup.svelte';
  import { goto } from '$app/navigation';

  let { channels }: { channels: ChannelPartial[] } = $props();

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
    <Button variant="outline" href="/dashboard/">PotatBotat</Button>
    {#if $userState?.login}
      <Button variant="outline" href="/dashboard/channel/{$userState.login}">My Channel</Button>
    {:else}
      <Button variant="outline" on:click={handleClickington}>My Channel</Button>
    {/if}
    <Button variant="outline" href="/dashboard/docs">Docs</Button>
    <Button variant="outline" href="/dashboard/faq">FAQ</Button>
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
    z-index: 3;
  }

  .left-section, .right-section {
    display: flex;
    gap: 8px;
    align-items: center;
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
    z-index: 4;
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
