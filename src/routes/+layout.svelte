<script lang="ts">
  import Nav from '$lib/components/nav/+top-bar.svelte';
  import { ModeWatcher } from "mode-watcher";
	import '../app.css';
  import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<ModeWatcher />

<header class="fixed top-0 left-0 w-full">
  <Nav />
</header>

<div class="pt-16">
  {@render children()}
</div>

<footer>
  <Toaster 
    theme={'dark'}
    richColors
    class="[&>div]:font-sans [&>div]:text-base [&>div]:shadow-lg" 
    toastOptions={{
      classes: {
        toast: 'bg-background text-foreground',
        title: 'text-lg font-semibold',
        description: 'text-muted-foreground',
        closeButton: 'bg-background text-foreground',
      }
    }}
  />
</footer>
