<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    goto(`/dashboard/channel/${$page.params.login}`, { replaceState: true });
  });
</script>
