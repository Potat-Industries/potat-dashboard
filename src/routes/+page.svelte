<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import LoginPopup from '$lib/components/login-popup/+login-popup.svelte';

  let openPopup = $state(false);

  const tryGoto = (path: string) => {
    if (!$userState?.login) {
      openPopup = true;

      return;
    }

    goto(path.replace('{login}', $userState.login));
  };
</script>

<div class="container">
  <h1>Welcome to Your PotatBotat Dashboard</h1>
  <p>Select an option below to get started:</p>

  <div class="button-group">
    <Button
      variant="ghost"
      on:click={() => tryGoto('/dashboard/channel/{login}')}
    >View My Channel Settings</Button>
    <Button
      variant="ghost"
      on:click={() => tryGoto('/dashboard/user/{login}')}
    >View My User Settings</Button>
    <Button
      variant="ghost"
      on:click={() => goto('/dashboard/terms')}
    >Terms of Service</Button>
    <Button
      variant="ghost"
      on:click={() => goto('/dashboard/privacy-policy')}
    >Privacy Policy</Button>
  </div>
</div>

<LoginPopup open={openPopup} empty={true} />

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-top: 100px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }
</style>
