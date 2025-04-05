<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import LogOut from "lucide-svelte/icons/log-out";
  import Lock from "lucide-svelte/icons/lock";
  import Handshake from "lucide-svelte/icons/handshake";
  import SunMoon from "lucide-svelte/icons/sun-moon"
  import Settings from "lucide-svelte/icons/settings"
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { toast } from "svelte-sonner";
  import { setMode } from "mode-watcher";
  import { onMount } from "svelte";
  import { userState, userToken } from "$lib/store/LocalStorage.svelte";
  import LoginPopup from "$lib/components/login-popup/+login-popup.svelte";
  import { goto } from "$app/navigation";

  let loggedIn = $derived(!!$userToken);

  let onLogout = (): void => {
    console.log("Logged out");
    userToken.set(null);
    userState.set(null);
    toast.success("Logged out", {
      duration: 2000,
      description: "You have been successfully logged out"
    });
  };

  const openPage = (page: string): void => {
    console.log(`Opening ${page}`);
    goto(`/dashboard/${page}`);
  };

  // mock
  let user = {
    pfp: "https://cdn.7tv.app/user/01G6HF7Y9R000AE6YXS14X580S/profile-picture/01H6MCAQ7G000EBVZZZ8Y7EDPR/3x.avif",
    login: "RyanPotat",
  };

  const handleMessage = (event: MessageEvent) => {
    const { id, login, name, stv_id, token, is_channel } = event.data ?? {};

    if (!token || !id) {
      return;
    }

    userToken.set(token);
    userState.set({
      id,
      login,
      name,
      stv_id,
      is_channel
    });
  };

  onMount((): void => {
    window.addEventListener('message', handleMessage);
  })
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
            <Avatar.Image src={user.pfp} alt="User avatar" />
            <Avatar.Fallback>
              <img src=/dashboard/default-pfp.png alt="Default avatar"/>
            </Avatar.Fallback>
          </Avatar.Root>
          <span class="leading-none">{user.login}</span>
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

        <DropdownMenu.Item on:click={()=>openPage(`user/${$userState?.login ?? ''}`)}>
          <Settings class="mr-2 h-4 w-4" />
          <span>User Settings</span>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item on:click={()=>openPage("privacy-policy")}>
          <Lock class="mr-2 h-4 w-4" />
          <span>Privacy Policy</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={()=>openPage("tos")}>
          <Handshake class="mr-2 h-4 w-4" />
          <span>Terms of Service</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={()=>openPage("contact")}>
          <Handshake class="mr-2 h-4 w-4" />
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
    <LoginPopup />
  {/if}
</div>
