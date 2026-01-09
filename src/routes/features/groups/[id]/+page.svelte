<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import GroupView from "$components/features/GroupView.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import TagGroup from "$entities/TagGroup";
  import { popupTitle } from "$stores/popup";

  let groupId = $derived<string>(page.params.id);
  let group = $derived<TagGroup | null>($tagGroups.find(group => group.id === groupId) || null);

  $effect(() => {
    if (groupId === 'new') {
      goto('/features/groups/new/edit');
      return;
    }

    if (!group) {
      console.warn(`Group ${groupId} not found.`);
      goto('/features/groups');
    } else {
      $popupTitle = `Tag Group: ${group.settings.name}`;
    }
  })
</script>

<Menu>
  <MenuItem href="/features/groups" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if group}
  <GroupView {group}/>
{/if}
<Menu>
  <hr>
  <MenuItem href="/features/groups/{groupId}/edit" icon="wrench">Edit Group</MenuItem>
  <MenuItem href="/features/groups/{groupId}/export" icon="file-export">Export Group</MenuItem>
  <MenuItem href="/features/groups/{groupId}/delete" icon="trash">Delete Group</MenuItem>
</Menu>
