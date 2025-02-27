<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import GroupView from "$components/features/GroupView.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import TagGroup from "$entities/TagGroup";
  import { permalinks } from "$lib/extension/EntityPermalinks";

  const groupPermalinks = permalinks.groups;

  let groupId = $derived<string>(page.params.id);
  let group = $derived<TagGroup | null>($tagGroups.find(group => group.id === groupId) || null);

  $effect(() => {
    if (groupId === 'new') {
      goto(groupPermalinks.edit('new'));
      return;
    }

    if (!group) {
      console.warn(`Group ${groupId} not found.`);
      goto(groupPermalinks.list());
    }
  })
</script>

<Menu>
  <MenuItem href={groupPermalinks.list()} icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if group}
  <GroupView {group}/>
{/if}
<Menu>
  <hr>
  <MenuItem href={groupPermalinks.edit(groupId)} icon="wrench">Edit Group</MenuItem>
  <MenuItem href={groupPermalinks.export(groupId)} icon="file-export">Export Group</MenuItem>
  <MenuItem href={groupPermalinks.delete(groupId)} icon="trash">Delete Group</MenuItem>
</Menu>
