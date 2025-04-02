<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar";

  export let platform;
  export let userConnection;
  export let connect: (platform: string) => void;
  export let disconnect: (platform: string) => void;
  export let refresh: (platform: string) => void;
</script>

<div style="margin-top: 0px; margin-bottom: 30px;">
  <div class="flex items-center justify-between ">
    <div class="flex items-center space-x-4">
      <Avatar.Root class="h-12 w-12">
        <Avatar.Image src={platform.icon} alt={platform.name} />
      </Avatar.Root>
      <div><b>{platform.name}</b></div>
      {#if userConnection && userConnection.username}
        <div>
          <p class="text-sm" style="color #6b7280">Connected as {userConnection.username}</p>
        </div>
      {/if}
    </div>
  
    {#if platform.automatic}
    <Button
      style="background-color: #DAA520"
      on:click={() => refresh(platform.name.toUpperCase())}
    >
      <span>Refresh</span>
    </Button>
    {:else if userConnection}
      <Button
        style="background-color: #dc2626"
        on:click={() => disconnect(platform.name.toUpperCase())}
      >
        <span>Disconnect</span>
      </Button>
    {:else if platform.disabled}
      <Button
        style="background-color: #808080"
        disabled
      >
        <span>Disabled</span>
      </Button>
    {:else}
      <Button
        style="background-color: #16a34a"
        on:click={() => connect(platform.name.toUpperCase())}
      >
        <span>Connect</span>
      </Button>
    {/if}
  </div>
  <p class="text-sm" style="margin-top: 10px">{platform?.description}</p>
</div>