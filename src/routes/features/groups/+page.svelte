<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import TagGroup from "$entities/TagGroup";
  import { permalinks } from "$lib/extension/EntityPermalinks";

  const groupPermalinks = permalinks.groups;

  let groups = $derived<TagGroup[]>($tagGroups.sort((a, b) => a.settings.name.localeCompare(b.settings.name)));
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <MenuItem href={groupPermalinks.edit('new')} icon="plus">Create New</MenuItem>
  {#if groups.length}
    <hr>
    {#each groups as group}
      <MenuItem href={groupPermalinks.detail(group.id)}>{group.settings.name}</MenuItem>
    {/each}
  {/if}
  <hr>
  <MenuItem href={groupPermalinks.import()}>Import Group</MenuItem>
</Menu>
