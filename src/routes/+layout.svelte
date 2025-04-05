<script lang="ts">
  import Nav from '$lib/components/nav/+top-bar.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from 'svelte-sonner';
  import '/src/app.css';

	let { data, children } = $props();
</script>

<ModeWatcher />

<div class="bg-image">
</div>

<header>
  <Nav channels={data.channels}/>
</header>

{@render children()}

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
      },
    }}
  />
</footer>

<style>
  .bg-image {
    background: linear-gradient(
      rgba(var(--bbackground), 0.9),
      rgba(var(--bbackground), 0.9)
    ), url('/home-low-quality.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh;

    /* Add Blur Effect */
    filter: blur(8px);
    -webkit-filter: blur(8px);

    position: fixed;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  header {
    position: sticky;
    top: 0;
    background: rgba(var(--bbackground), 0.5);
  }
</style>
