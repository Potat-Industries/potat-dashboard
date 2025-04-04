<script lang="ts">
  import Dropdown from "$lib/components/user-dropdown/user-dropdown.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  // TODO: $types?
  import type { ChannelPartial } from "../../../routes/+layout";
  import { userStore } from "../../../store/userStore";

  export let channels: ChannelPartial[] = [];
  let searchQuery = '';
  // let selectedIndex = -1;

  const selectChannel = (index: number): void => {
    searchQuery = channels[index]?.username;
    // selectedIndex = index;
  }

  let login: string;
  userStore.subscribe((value) => {
    if (value && value.login) {
      login = value.login;
    } else {
      // TODO: force login?
      login = '';
    }
  })

  $: filteredChannels = channels
    .filter(channel => channel.username.startsWith(searchQuery.toLowerCase()))
    .slice(0, 5);
</script>

<nav>
  <div class="left-section">
    <Button variant="ghost">
      <a href="/dashboard/">PotatBotat</a>
    </Button>
    <Button variant="ghost">
      <a href="/dashboard/channel/{login}">My Channel</a>
    </Button>
  </div>
  <div class="search-container">
    <Input bind:value={searchQuery} placeholder="Search Channels..." maxlength={25} />
    
    {#if searchQuery && filteredChannels.length > 0}
      <ul class="search-results rounded-md">
        {#each filteredChannels as channel, index (channel.channel_id)}
          <div>
            <Button 
              variant="ghost" 
              style="width: 100%; justify-content: left;" 
              on:click={() => selectChannel(index)}
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

<style>
  nav {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: hsla(var(--background), 0.8);
    border-bottom: 1px solid hsl(var(--border));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 100;
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
