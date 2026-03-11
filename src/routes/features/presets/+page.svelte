<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";
  import { sortEntitiesByField } from "$lib/utils";

  let presets = $derived(sortEntitiesByField($tagEditorPresets, "name"))
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <MenuItem href="/features/presets/new/edit" icon="plus">Create New</MenuItem>
  {#if presets.length}
    <hr>
    {#each presets as preset}
      <MenuItem href="/features/presets/{preset.id}">{preset.settings.name}</MenuItem>
    {/each}
  {/if}
</Menu>
