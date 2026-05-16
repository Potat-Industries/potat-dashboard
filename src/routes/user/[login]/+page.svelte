<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  goto(`/dashboard/channel/${$page.params.login}`, { replaceState: true });
</script>