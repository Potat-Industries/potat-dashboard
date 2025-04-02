<script lang="ts">
  import Label from "$lib/components/ui/label/label.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { toast } from "svelte-sonner";
  import { onMount, tick } from "svelte";
  import type { Setting } from ".";

  export let title: string;
  export let defaults: Setting[];
  export let loadSettings: () => Promise<Record<string, any>>;
  export let updateSettings: (settings: Record<string, any>) => Promise<{ ok: boolean, error: string }>;

  let initialSettings: Record<string, any>;
  let currentSettings: Record<string, any> = {};
  let hasChanges = false;

  const handleUpdate = (key: keyof Record<string, any>, value: any): void => {
    currentSettings[key] = value;
    currentSettings = { ...currentSettings };
  }

  const getButtonClass = () => {
    if (!hasChanges) {
      return "opacity-50 cursor-not-allowed";
    } 
    return "bg-green-600 hover:bg-green-700";
  }

  const saveChanges = async () => {
    const { ok, error } = await updateSettings?.(currentSettings) ?? {};
    if (ok) {
      console.log("Changes saved:", currentSettings);
      initialSettings = { ...currentSettings };
      toast.success("Changes saved", {
        duration: 2000,
        description: "Your settings have been saved"
      });
    } else {
      console.error("Failed to save changes");
      currentSettings = { ...initialSettings };
      toast.error("Failed to save changes", {
        duration: 2000,
        description: error ?? "Something went wrong"
      });
    }
    hasChanges = false;
  }

  // watch for settings changes
  $: {
    if (initialSettings) {
      hasChanges = JSON.stringify(currentSettings) 
               !== JSON.stringify(initialSettings);
    }
  }

  onMount(async () => {
    const loadedSettings = await loadSettings();
    const defaultSettings = defaults.reduce((acc, setting) => {
      acc[setting.id] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    initialSettings = { ...defaultSettings, ...loadedSettings };
    currentSettings = { ...initialSettings };
    console.log("Loaded settings:", currentSettings);

    await tick();
  });
</script>

<div class="flex justify-center">
  <form class="w-full max-w-3xl" style="padding-left: 20px; padding-right: 20px;">
    <fieldset class="space-y-8 rounded-lg border p-6">
      <legend class="px-2 text-lg font-semibold">{title}</legend>
  
      {#if !initialSettings}
        <div class="flex justify-center">
          <span class="loading loading-ring loading-sm"></span>
          <p>Loading...</p>
        </div>
  
      {:else}
        {#each defaults as config (config.id)}
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for={config.id} class="text-base font-medium">
                {config.id.split('_').join(' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
              </Label>
              <p class="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
  
            {#if config.type === 'boolean'}
              <div class="flex justify-start">
                <Switch
                  id={config.id}
                  bind:checked={currentSettings[config.id] as boolean}
                  on:click={() => handleUpdate(config.id, !currentSettings[config.id])}
                />
              </div>
  
            {:else if config.type === 'choice' && config.possibleValues}
              <div class="w-full max-w-xs">
                <Select.Root 
                  bind:selected={currentSettings[config.id]}
                  on:onSelectedChange={(e) => handleUpdate(config.id, e.detail.selected)}
                >
                  <Select.Trigger id={config.id} class="w-full">
                    <Select.Value
                      placeholder={`Select ${config.id.replace('_', ' ')}`} 
                    />
                  </Select.Trigger>
                  <Select.Content class="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto border rounded-md shadow-lg">
                    {#if config.defaults?.length}
                      {#each config.defaults as topLang}
                        <Select.Item value={topLang}>{topLang}</Select.Item>
                      {/each}
                
                      <Select.Separator class="border-t my-1" />
                    {/if}
              
                    {#each config.possibleValues as value}
                      <Select.Item value={value}>{value}</Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>
  
            {:else if config.type === 'number'}
              <div class="w-full max-w-xs">
                <input
                  type="number"
                  id={config.id}
                  class="w-full rounded-md border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                  bind:value={currentSettings[config.id]}
                  on:input={(e) => handleUpdate(
                    config.id, 
                    (e.target as HTMLInputElement)?.value
                  )}
                />
              </div>
  
            {:else}
              <div class="w-full max-w-xl">
                <input
                  type="text"
                  id={config.id}
                  class="w-full rounded-md border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                  bind:value={currentSettings[config.id]}
                  on:input={(e) => handleUpdate(
                    config.id, 
                    (e.target as HTMLInputElement)?.value
                  )}
                />
              </div>
            {/if}
          </div>
        {/each}
  
        <div class="pt-6">
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
  </form>
</div>