<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import type TagGroup from "$entities/TagGroup";
  import { permalinks } from "$lib/extension/EntityPermalinks";

  const groupPermalinks = permalinks.groups;

  const groupId = $derived<string>(page.params.id);
  const targetGroup = $derived<TagGroup | undefined>($tagGroups.find(group => group.id === groupId));

  $effect(() => {
    if (!targetGroup) {
      goto(groupPermalinks.list());
    }
  })

  async function deleteGroup() {
    if (!targetGroup) {
      console.warn('Attempting to delete the group, but the group is not loaded yet.');
      return;
    }

    await targetGroup.delete();
    await goto(groupPermalinks.list());
  }
</script>

<Menu>
  <MenuItem href={groupPermalinks.detail(groupId)} icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if targetGroup}
  <p>
    Do you want to remove group "{targetGroup.settings.name}"? This action is irreversible.
  </p>
  <Menu>
    <hr>
    <MenuItem onclick={deleteGroup}>Yes</MenuItem>
    <MenuItem href={groupPermalinks.detail(groupId)}>No</MenuItem>
  </Menu>
{:else}
  <p>Loading...</p>
{/if}
