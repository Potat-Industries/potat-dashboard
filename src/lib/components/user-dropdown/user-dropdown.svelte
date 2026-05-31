<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import LogOut from 'lucide-svelte/icons/log-out';
  import Lock from 'lucide-svelte/icons/lock';
  import Handshake from 'lucide-svelte/icons/handshake';
  import MessageCircle from 'lucide-svelte/icons/message-circle';
  import SunMoon from 'lucide-svelte/icons/sun-moon';
  import Settings from 'lucide-svelte/icons/settings';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import { toast } from 'svelte-sonner';
  import { setMode, toggleMode } from 'mode-watcher';
  import { userState } from '$lib/store/LocalStorage.svelte';
  import LoginPopup from '$lib/components/login-popup/+login-popup.svelte';
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';

  let loggedIn = $derived(!!$userState);

  let onLogout = async (): Promise<void> => {
    try {
      await fetch(`${env.PUBLIC_API_BASE_URL ?? 'https://api.potat.app'}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // non-fatal
    }
    userState.set(null);
    toast.success('Logged out', {
      duration: 2000,
      description: 'You have been successfully logged out',
    });
  };

  const openPage = (page: string): void => {
    console.log(`Opening ${page}`);
    goto(`/dashboard/${page}`);
  };

  let userPfp = $derived($userState?.pfp ?? null);
  let userLogin = $derived($userState?.name ?? $userState?.login ?? '');
</script>

<div>
  {#if loggedIn}
    <DropdownMenu.Root closeOnItemClick={false}>

      <DropdownMenu.Trigger asChild let:builder>
        <Button
          variant="ghost"
          size="default"
          class="gap-2"
          builders={[builder]}
        >
          <Avatar.Root class="h-6 w-6">
            <Avatar.Image src={userPfp} alt="User avatar" />
            <Avatar.Fallback>
              <img src=/dashboard/default-pfp.png alt="Default avatar"/>
            </Avatar.Fallback>
          </Avatar.Root>
          <span class="leading-none">{userLogin}</span>
          <ChevronDown class="size-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <SunMoon class="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item on:click={()=>setMode('dark')}>
              <Moon class="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item on:click={()=>setMode('light')}>
              <Sun class="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item on:click={()=>setMode('system')}>
              <Sun class="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        <DropdownMenu.Item on:click={()=>goto(`/dashboard/channel/${$userState?.login ?? ''}#settings`)}>
          <Settings class="mr-2 h-4 w-4" />
          <span>User Settings</span>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item on:click={()=>openPage('privacy-policy')}>
          <Lock class="mr-2 h-4 w-4" />
          <span>Privacy Policy</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={()=>openPage('terms')}>
          <Handshake class="mr-2 h-4 w-4" />
          <span>Terms of Service</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={()=>openPage('contact')}>
          <MessageCircle class="mr-2 h-4 w-4" />
          <span>Contact</span>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item>
          <LogOut class="mr-2 h-4 w-4" />
          <AlertDialog.Root on:cancel={()=>{}}>
            <AlertDialog.Trigger>Log out</AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>
                  Are you sure you want to log out?
                </AlertDialog.Title>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>No</AlertDialog.Cancel>
                <AlertDialog.Action on:click={onLogout}>Yes</AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </DropdownMenu.Item>

      </DropdownMenu.Content>

    </DropdownMenu.Root>
  {:else}
    <div class="flex items-center justify-between">
      <LoginPopup />
      <Button on:click={toggleMode} variant="outline" size="icon" class="ml-2">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
      </Button>
    </div>
    <div>

    </div>
  {/if}
</div>
