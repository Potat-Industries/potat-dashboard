<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { cn } from '$lib/utils';

  let { href, src, alt, title, class: extraClass = '' } = $props();

  let loaded = $state(false);

  function handleLoad() {
    loaded = true;
  }
</script>

<a href={href}>
  {#if !loaded}
    <Skeleton class="flex items-center justify-center w-10 h-10 {extraClass}" />
  {/if}

  <img
    src={src}
    alt={alt}
    title={title}
    style="display: {loaded ? 'inline' : 'none'}"
    class={cn('h-full w-auto', loaded ? 'hidden' : null, extraClass)}
    onload={handleLoad}
  />
</a>

<style>
  img {
    transition: opacity 0.2s ease-in-out;
    opacity: 1;
  }
  :global(.avatar img) {
    opacity: 0;
  }
</style>
