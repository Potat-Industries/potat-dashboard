<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { onMount } from "svelte";
  import { Label } from "$lib/components/ui/label/index.js";
  import { userToken } from "$lib/store/LocalStorage.svelte"; 

  type Reminder = {
    reminder_id: number;
    message: string;
    recipient: string;
    channel: string;
    dateSet: string;
    dateReady: string;
  };

  let reminders: Reminder[] = [];
  let isLoading = false;

  let newReminder = {
    message: "",
    recipient: "",
    channel: "",
    dateReady: "",
  };

  userToken;

  const loadReminders = async () => {
    isLoading = true;
    try {
      let reminders = [
        {
          reminder_id: 1,
          message: "You were going to gift me a sub, right?",
          recipient: "elis",
          channel: "forsen",
          dateSet: new Date().toISOString(),
          dateReady: new Date(Date.now() + 5000000).toISOString(),
        },
        {
          reminder_id: 2,
          message: "Please stop gambling brother",
          recipient: "xQc",
          channel: "xQc",
          dateSet: new Date().toISOString(),
          dateReady: new Date(Date.now() + 500000).toISOString(),
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return reminders.sort((a, b) => {
        return new Date(a.dateReady).getTime() - 
          new Date(b.dateReady).getTime();
      });
    } catch (error) {
      console.error("Failed to load reminders:", error);
      return [];
    } finally {
      isLoading = false;
    }
  }

  function deleteReminder(id: number) {
    const apiCall = () => { return true };

    if (!apiCall()) {
      console.error("Failed to delete reminder");
      // popup error message
      return;
    }

    reminders = reminders.filter((reminder) => reminder.reminder_id !== id);
  }

  onMount(async () => {
    reminders = await loadReminders();
  });
</script>

<div class="flex justify-center">
  <fieldset class="grid gap-6 rounded-lg border p-4" style="padding: 0px; padding-left: 20px; padding-right: 20px;">
    <legend class="px-2 text-lg font-semibold">Reminders</legend>
    <div>
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Fill out the details below to send a new reminder.
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label for="recipient">Recipient</Label>
              <Input
                id="recipient"
                bind:value={newReminder.recipient}
                placeholder="Enter recipient"
              />
            </div>
            <div class="grid gap-2">
              <Label for="channel">Channel</Label>
              <Input
                id="channel"
                bind:value={newReminder.channel}
                placeholder="Enter channel"
              />
            </div>
            <div class="grid gap-2">
              <Label for="dateReady">Date Ready</Label>
              <Input
                id="dateReady"
                type="date"
                bind:value={newReminder.dateReady}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Date Set</TableHead>
          <TableHead>Date Ready</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if isLoading}
          <TableRow>
            <TableCell colspan={5}>Loading Reminders...</TableCell>
          </TableRow>
        {:else if reminders.length === 0}
          <TableRow>
            <TableCell colspan={7}>No reminders found</TableCell>
          </TableRow>
        {/if}
        {#each reminders as reminder (reminder.reminder_id)}
          <TableRow>
            <TableCell>{reminder.reminder_id}</TableCell>
            <TableCell>{reminder.message}</TableCell>
            <TableCell>{reminder.recipient}</TableCell>
            <TableCell>{reminder.channel}</TableCell>
            <TableCell>{reminder.dateSet}</TableCell>
            <TableCell>{reminder.dateReady}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                on:click={() => deleteReminder(reminder.reminder_id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </fieldset>
</div>