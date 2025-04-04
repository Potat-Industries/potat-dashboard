<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  const navigate = (path: string) => goto(path);

  const getUserLogin = (): string | undefined => {
    if (!browser) {
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData)?.login;
    }
  }

  const tryNaviagte = (path: string) => {
    const login = getUserLogin();
    if (!login) {
      // do something idk?

      return;
    }

    navigate(path.replace('{login}', login));
  }
</script>

<div class="container">
  <h1>Welcome to Your PotatBotat Dashboard</h1>
  <p>Select an option below to get started:</p>
  
  <div class="button-group">
    <Button 
      variant="ghost" 
      on:click={() => tryNaviagte('/dashboard/channel/{login}')}
    >View My Channel Settings</Button>
    <Button 
      variant="ghost"
      on:click={() => tryNaviagte('/dashboard/user/{login}')}
    >View My User Settings</Button>
    <Button 
      variant="ghost" 
      on:click={() => navigate('/dashboard/tos')}
    >Terms of Service</Button>
    <Button 
      variant="ghost" 
      on:click={() => navigate('/dashboard/privacy-policy')}
    >Privacy Policy</Button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-top: 100px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }
</style>
