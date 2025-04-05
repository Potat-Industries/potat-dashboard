<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button/index.js";
  import { userState, userToken } from "$lib/store/LocalStorage.svelte";

  let { open = false, empty = false } = $props();

  let onLogin = async (): Promise<void> => {
    window.open(
      `https://api.potat.industries/login`,
      '_blank',
      'width=600,height=400'
    );

    // Mocked example result of postMessage from the window after successful login
    userToken.set('mock-test-token-definitely-real');
    userState.set({
      id: "457260003",
      login: "ryanpotat",
      name: "RyanPotat",
      stv_id: "01G6HF7Y9R000AE6YXS14X580S",
      is_channel: false
    });

    open = false;
  };
</script>

<AlertDialog.Root bind:open on:cancel={() => (open = false)}>
  <AlertDialog.Trigger>
    {#if !empty}
      <Button variant="ghost" size="default">
        Login
      </Button>
    {/if}
  </AlertDialog.Trigger>

  <AlertDialog.Content>

    <AlertDialog.Header>
      <AlertDialog.Action on:click={onLogin}>
        Sign in with Twitch
      </AlertDialog.Action>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <p>
        By signing in, you agree to our
        <a href="/privacy"> Privacy Policy </a>
        and
        <a href="/terms"> Terms of Service</a>.
      </p>
    </AlertDialog.Footer>    
    
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
  a {
    color: #2196f3;
    text-decoration: none;
    white-space: nowrap;
  }

  a:hover {
    text-decoration: underline;
  }
</style>


