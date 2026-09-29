<script lang="ts">
  import Label from '$lib/components/ui/label/label.svelte';
  import Switch from '$lib/components/ui/switch/switch.svelte';
  import * as Select from '$lib/components/ui/select/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { toast } from 'svelte-sonner';
  import { onMount, tick } from 'svelte';
  import type { Setting } from '.';
  import type { Selected } from 'bits-ui';

  let { title, defaults, loadSettings, updateSettings }: {
    title: string;
    defaults: Setting[];
    loadSettings: () => Promise<Record<string, unknown>>;
    updateSettings: (settings: Record<string, unknown>) => Promise<{ ok: boolean, error: string }>;
  } = $props();

  let initialSettings: Record<string, unknown> | null = $state(null);
  let currentSettings: Record<string, unknown> = $state({});

  const handleUpdate = (key: keyof Record<string, unknown>, value: unknown): void => {
    currentSettings[key] = value;
    currentSettings = { ...currentSettings };
  };

  const getButtonClass = () => {
    if (!hasChanges) {
      return 'opacity-50 cursor-not-allowed';
    }
    return 'bg-green-600 hover:bg-green-700';
  };

  const saveChanges = async () => {
    const { ok, error } = await updateSettings?.(currentSettings) ?? {};
    if (ok) {
      console.log('Changes saved:', currentSettings);
      initialSettings = { ...currentSettings };
      toast.success('Changes saved', {
        duration: 2000,
        description: 'Your settings have been saved',
      });
    } else {
      console.error('Failed to save changes');
      currentSettings = { ...initialSettings };
      toast.error('Failed to save changes', {
        duration: 2000,
        description: error ?? 'Something went wrong',
      });
    }
    hasChanges = false;
  };

  let hasChanges = $derived(JSON.stringify(currentSettings) !== JSON.stringify(initialSettings));

  onMount(async () => {
    const defaultSettings = defaults.reduce((acc, setting) => {
      acc[setting.id] = setting.value;
      return acc;
    }, {} as Record<string, unknown>);
    try {
      const loadedSettings = await loadSettings();
      initialSettings = { ...defaultSettings, ...loadedSettings };
    } catch {
      initialSettings = { ...defaultSettings };
    }
    currentSettings = { ...initialSettings };
    console.log('Loaded settings:', currentSettings);

    await tick();
  });
</script>

<div class="flex justify-center px-4">
  <fieldset class="w-full max-w-3xl space-y-5 rounded-lg border p-6">
    <legend class="px-2 text-lg font-semibold">{title}</legend>

      {#if !initialSettings}
        <div class="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Loading settings…
        </div>

      {:else}
        <!-- Input / select / number settings in a 2-column grid -->
        <div class="grid gap-4 sm:grid-cols-2">
          {#each defaults.filter(c => c.type !== 'boolean') as config (config.id)}
            <div class="grid gap-1.5">
              <Label for={config.id} class="text-sm font-medium">
                {config.id.split('_').join(' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
              </Label>
              <p class="text-xs text-muted-foreground">{config.description}</p>

              {#if config.type === 'choice' && config.possibleValues}
                <Select.Root
                  bind:selected={currentSettings[config.id] as Selected<unknown> | undefined}
                  on:onSelectedChange={(e) => handleUpdate(config.id, e.detail.selected)}
                >
                  <Select.Trigger id={config.id} class="w-full">
                    <Select.Value placeholder={`Select ${config.id.replace('_', ' ')}`} />
                  </Select.Trigger>
                  <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto rounded-md border shadow-lg">
                    {#if config.defaults?.length}
                      {#each config.defaults as topLang}
                        <Select.Item value={topLang}>{topLang}</Select.Item>
                      {/each}
                      <Select.Separator class="my-1 border-t" />
                    {/if}
                    {#each config.possibleValues as value}
                      <Select.Item value={value}>{value}</Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>

              {:else if config.type === 'number'}
                <input
                  type="number"
                  id={config.id}
                  class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  bind:value={currentSettings[config.id]}
                  oninput={(e) => handleUpdate(config.id, (e.target as HTMLInputElement)?.value)}
                />

              {:else}
                <input
                  type="text"
                  id={config.id}
                  class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  bind:value={currentSettings[config.id]}
                  oninput={(e) => handleUpdate(config.id, (e.target as HTMLInputElement)?.value)}
                />
              {/if}
            </div>
          {/each}
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          {#each defaults.filter(c => c.type === 'boolean') as config (config.id)}
            <div class="flex items-center justify-between rounded-md border px-3 py-2.5">
              <div class="min-w-0 flex-1 pr-3">
                <p class="text-sm font-medium leading-none">
                  {config.id.split('_').join(' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">{config.description}</p>
              </div>
              <Switch
                id={config.id}
                bind:checked={currentSettings[config.id] as boolean}
                on:click={() => handleUpdate(config.id, !currentSettings[config.id])}
              />
            </div>
          {/each}
        </div>

        <div class="pt-2">
          <Button
            on:click={saveChanges}
            class={getButtonClass()}
            disabled={!hasChanges}
          >Save Changes</Button>
        </div>

        {#if hasChanges}
          <!-- on page leave warn unsaved changes? -->
        {/if}

      {/if}

    </fieldset>
  </div>