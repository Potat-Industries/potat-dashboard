<script lang="ts">
  import ArrowRightFromLine from 'lucide-svelte/icons/arrow-right-from-line';
  import ArrowLeftFromLine from 'lucide-svelte/icons/arrow-left-from-line';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Tabs, TabsContent } from '$lib/components/ui/tabs/index.js';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { TabConfig } from '.';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { tabs }: { tabs: TabConfig[] } = $props();

  let sidebarExpanded: boolean = $state(false);
  let activeTab: string | undefined = $state(undefined);

  $effect(() => {
    const h = $page.url.hash.replace('#', '');
    if (h && tabs.some(t => t.id === h)) {
      activeTab = h;
    } else {
      activeTab = tabs[0]?.id;
    }
  });

  const toggleSidebar = () => {
    sidebarExpanded = !sidebarExpanded;
    if (browser) {
      localStorage.setItem('sidebarExpanded', JSON.stringify(sidebarExpanded));
    }
  };

  const isSidebarExpanded = () => sidebarExpanded ? 'default' : 'icon';

  const isTabActive = (t: string): string => {
    return activeTab === t ? 'bg-muted rounded-lg' : 'rounded-lg';
  };

  const handleTabChange = (value: string): void => {
    activeTab = value;
    goto(`#${value}`);
  };

  const checkSidebarWidth = () => {
    // TODO: dynamically open the sidebar on page width?
    const savedSidebarState = localStorage.getItem('sidebarExpanded');
    if (savedSidebarState !== null) {
      sidebarExpanded = JSON.parse(savedSidebarState);
    } else {
      sidebarExpanded = false;
    }
  };

  onMount(() => {
    if (browser) {
      checkSidebarWidth();

      window.addEventListener('resize', checkSidebarWidth);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', checkSidebarWidth);
    }
  });
</script>

<div
  class="grid w-full"
  class:pl-[53px]={!sidebarExpanded}
  class:pl-[150px]={sidebarExpanded}
>
  <aside
    class="inset-y fixed left-0 z-20 flex h-full flex-col"
    class:w-[53px]={!sidebarExpanded}
    class:w-[150px]={sidebarExpanded}
  >
    <div class="p-2">
      <Button variant="outline" size="icon" aria-label="Toggle sidebar" on:click={toggleSidebar}>
        {#if sidebarExpanded}
          <ArrowLeftFromLine class="fill-foreground size-5" />
        {:else}
          <ArrowRightFromLine class="fill-foreground size-5" />
        {/if}
      </Button>
    </div>
    <nav class="grid gap-1 p-2">
      {#each tabs as tab (tab.id)}
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <span>
              <Button
                variant="ghost"
                size={isSidebarExpanded()}
                class={isTabActive(tab.id)}
                aria-label={tab.label}
                on:click={() => handleTabChange(tab.id)}
                builders={[builder]}
              >
                {#key tab.icon}
                  <tab.icon class="size-5" />
                {/key}
                {#if sidebarExpanded}
                  <span class="ml-2">{tab.label}</span>
                {/if}
              </Button>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content side="right" sideOffset={5}>
            {tab.label}
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </nav>
  </aside>
  {#if activeTab === undefined}
    <div class="flex justify-center">
      <form class="w-full max-w-3xl p-20">
        <fieldset class="space-y-8 rounded-lg border p-6" style="box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3)">
          <div class="flex justify-center">
            <span class="loading loading-ring loading-sm"></span>
            <p>Loading...</p>
          </div>
        </fieldset>
      </form>
    </div>
  {:else}
    <div class="flex flex-col">
      <main class="flex-1 overflow-auto p-4">
        <Tabs bind:value={activeTab} on:change={(e) => handleTabChange(e.detail.value)}>
          {#each tabs as tab (tab.id)}
            <TabsContent value={tab.id}>
              {#if tab.component}
                {#key tab.id}
                  <tab.component />
                {/key}
              {/if}
            </TabsContent>
          {/each}
        </Tabs>
      </main>
    </div>
  {/if}
</div>

<style>
  nav {
    transition: width 0.2s ease;
  }

  @media (max-width: 400px) {
    nav {
      grid-template-columns: 1fr;
      gap: 5px;
    }
  }
</style>
