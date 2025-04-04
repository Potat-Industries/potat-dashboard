<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  let messagesSent = 120;
  let commandsUsed = 45;
</script>

<div class="grid gap-6 rounded-lg border p-4">
  <h2 class="text-lg font-semibold">User Statistics</h2>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <Label>Messages Sent</Label>
      <p class="text-2xl font-bold">{messagesSent}</p>
    </div>
    <div>
      <Label>Commands Used</Label>
      <p class="text-2xl font-bold">{commandsUsed}</p>
    </div>
  </div>
</div>