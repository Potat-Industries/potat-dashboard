<script lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { onMount } from 'svelte';
  import { Label } from '$lib/components/ui/label/index.js';
  import { toast } from 'svelte-sonner';
  import { fetchBackend } from '$lib/utils';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';

  type Reminder = {
    reminder_id: number;
    message: string;
    recipient: string;
    channel: string;
    dateSet: string;
    dateReady: string;
  };

  let reminders: Reminder[] = $state([]);
  let isLoading = $state(false);
  let reminderToDelete: number | null = $state(null);
  let deletingReminder = $state(false);

  let newReminder = {
    message: '',
    recipient: '',
    channel: '',
    dateReady: '',
  };

  const loadReminders = async () => {
    isLoading = true;
    try {
      const res = await fetchBackend<Reminder>('user/reminders', { auth: true });
      if (res.errors?.length) {
        toast.error('Failed to load reminders', {
          description: res.errors[0].message,
          duration: 4000,
        });
        return [];
      }
      return (res.data ?? []).sort((a, b) =>
        new Date(a.dateReady).getTime() - new Date(b.dateReady).getTime()
      );
    } catch (error) {
      console.error('Failed to load reminders:', error);
      return [];
    } finally {
      isLoading = false;
    }
  };

  const deleteReminder = async () => {
    const id = reminderToDelete;
    if (id === null) return;
    deletingReminder = true;
    try {
      const res = await fetchBackend(`user/reminders/${id}`, {
        method: 'DELETE',
        auth: true,
      });
      if (res.errors?.length) {
        toast.error('Failed to delete reminder', {
          description: res.errors[0].message,
          duration: 4000,
        });
        return;
      }
      reminders = reminders.filter((reminder) => reminder.reminder_id !== id);
      toast.success('Reminder deleted', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to delete reminder');
      console.error(error);
    } finally {
      deletingReminder = false;
      reminderToDelete = null;
    }
  };

  onMount(async () => {
    reminders = await loadReminders();
  });
</script>

<AlertDialog.Root open={reminderToDelete !== null} onOpenChange={(o) => { if (!o) reminderToDelete = null; }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete reminder #{reminderToDelete}?</AlertDialog.Title>
      <AlertDialog.Description>
        This reminder will be permanently deleted and cannot be recovered.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        on:click={deleteReminder}
        disabled={deletingReminder}
      >
        {deletingReminder ? 'Deleting…' : 'Delete'}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

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
                on:click={() => (reminderToDelete = reminder.reminder_id)}
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