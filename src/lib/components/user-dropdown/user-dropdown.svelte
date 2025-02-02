<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import LogOut from "lucide-svelte/icons/log-out";
  import Lock from "lucide-svelte/icons/lock";
  import Handshake from "lucide-svelte/icons/handshake";
  import SunMoon from "lucide-svelte/icons/sun-moon"
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { toast } from "svelte-sonner";
  import { setMode } from "mode-watcher";

  // placeholders
  let loggedIn = true;
  export let onLogout = (): void => {
    loggedIn = false;
    console.log("Logged out");
    localStorage.removeItem("token");
    toast.success("Logged out", {
      duration: 2000,
      description: "You have been successfully logged out"
    });
  };

  export let onLogin = async (): Promise<void> => {
    const apiRequest = async (): Promise<boolean> => {
      // 50/50 for now
      return Math.random() > 0.5;
    }

    if (!(await apiRequest())) {
      toast.error("Failed to log in", {
        duration: 2000,
        description: "Something went wrong"
      });
      return;
    }

    loggedIn = true;
    console.log("Logging in");
    localStorage.setItem("token", "1234");
    let description = 'Sucessfully logged in';
  
    const userData = localStorage.getItem('user');
    if (userData && typeof userData === 'string') {
      try {
        const user = JSON.parse(userData);
        console.log(userData, user)
        if (user) {
          description = `Welcome back ${user.login}`;
        }
      } catch {}
    }

    toast.success("Logged in", {
      duration: 2000,
      description
    });
  };
  export let openPrivacyPolicy = (): void => openPage("privacy-policy");
  export let openTermsOfService = (): void => openPage("tos");
  export let openPage = (page: string): void => {
    console.log(`Opening ${page}`);
    window.location.href = `/${page}`;
  };

  let user = {
    pfp: "https://cdn.7tv.app/user/01G6HF7Y9R000AE6YXS14X580S/profile-picture/01H6MCAQ7G000EBVZZZ8Y7EDPR/3x.avif",
    login: "RyanPotat",
  };
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
              <img src=/default-pfp.png alt="Default avatar"/>
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

        <DropdownMenu.Item on:click={openPrivacyPolicy}>
          <Lock class="mr-2 h-4 w-4" />
          <span>Privacy Policy</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={openTermsOfService}>
          <Handshake class="mr-2 h-4 w-4" />
          <span>Terms of Service</span>
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
    <AlertDialog.Root on:cancel={()=>{}}>
      <AlertDialog.Trigger>
        <Button variant="ghost" size="default">
          Login
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Action on:click={onLogin}>
            Sign in with Twitch
          </AlertDialog.Action>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          By signing in, you agree to our Privacy Policy and Terms of Service.
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  {/if}
</div>
