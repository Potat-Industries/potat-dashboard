<script lang="ts">
  import Nav from '$lib/components/nav/+top-bar.svelte';
  import { ModeWatcher } from "mode-watcher";
	import '../app.css';
  import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<ModeWatcher />

<header>
  <Nav />
</header>

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

{@render children()}
