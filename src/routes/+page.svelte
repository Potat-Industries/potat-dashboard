<script lang="ts">
  import { goto } from '$app/navigation';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import LoginPopup from '$lib/components/login-popup/+login-popup.svelte';
  import Tv2 from 'lucide-svelte/icons/tv-2';
  import ExternalLink from 'lucide-svelte/icons/external-link';
  import Shield from 'lucide-svelte/icons/shield';

  let openPopup = $state(false);

  const tryGoto = (path: string) => {
    if (!$userState?.login) {
      openPopup = true;
      return;
    }
    goto(path.replace('{login}', $userState.login));
  };
</script>

<div class="flex flex-col items-center px-4 gap-6 pt-24">
  <div class="text-center space-y-2">
    <h1 class="text-5xl font-bold tracking-tight">PotatBotat Dashboard</h1>
    <p class="text-muted-foreground">Manage your bot settings, view emote stats, and more.</p>
  </div>

  <div class="flex flex-col gap-3 w-64">
    <button
      class="flex items-center gap-4 rounded-xl border bg-card px-8 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onclick={() => tryGoto('/dashboard/channel/{login}')}
    >
      <Tv2 class="size-5 text-primary" />
      <span class="font-semibold">My Dashboard</span>
    </button>

    <a
      href="/dashboard/privacy-policy"
      class="flex items-center gap-4 rounded-xl border bg-card px-8 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Shield class="size-5 text-primary" />
      <span class="font-semibold">Privacy Policy</span>
    </a>

    <a
      href="https://potat.app"
      class="flex items-center gap-4 rounded-xl border bg-card px-8 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ExternalLink class="size-5 text-primary" />
      <span class="font-semibold">potat.app</span>
    </a>
  </div>
</div>

<LoginPopup bind:open={openPopup} empty={true} />
