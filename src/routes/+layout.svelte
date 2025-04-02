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

<div class="content">
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

<style>
  .content {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }

  header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 64px;
    background: rgba(var(--bbackground), 0.5);
  }
</style>
