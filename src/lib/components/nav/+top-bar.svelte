<script lang="ts">
  import Dropdown from "$lib/components/user-dropdown/user-dropdown.svelte";
  import { Button } from "$lib/components/ui/button";
</script>

<nav>
  <div class="left-section">
    <Button variant="ghost">
      <a href="/dashboard/">PotatBotat</a>
    </Button>
    <Button variant="ghost">
      <a href="/dashboard/channel">Channel</a>
    </Button>
  </div>
  <div class="right-section">
    <Dropdown />
  </div>
</nav>

<style>
  nav {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: hsla(var(--background), 0.8); 
    border-bottom: 1px solid hsl(var(--border));
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .left-section {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .right-section {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  a {
    color: hsl(var(--foreground));
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: hsl(var(--primary));
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 400px) {
    nav {
      flex-direction: column;
      gap: 10px;
      padding: 10px;
    }

    .left-section {
      justify-content: center;
      margin-bottom: 10px;
    }

    .right-section {
      justify-content: center;
    }
  }
</style>