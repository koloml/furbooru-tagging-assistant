<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { page } from "$app/state";
  import TagEditorPreset from "$entities/TagEditorPreset";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";
  import { goto } from "$app/navigation";
  import { popupTitle } from "$stores/popup";

  const presetId = $derived(page.params.id);
  const targetPreset = $derived<TagEditorPreset | null>(
    $tagEditorPresets.find(preset => preset.id === presetId) || null
  );

  $effect(() => {
    if (!targetPreset) {
      goto('/features/presets');
    } else {
      $popupTitle = `Deleting Preset: ${targetPreset.settings.name}`
    }
  });

  async function deletePreset() {
    if (!targetPreset) {
      console.warn('Attempting to delete the preset, but the preset is not loaded yet.');
      return;
    }

    await targetPreset.delete();
    await goto('/features/presets');
  }
</script>

<Menu>
  <MenuItem href="/features/presets/{presetId}" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if targetPreset}
  <p>
    Do you want to remove preset "{targetPreset.settings.name}"? This action is irreversible.
  </p>
  <Menu>
    <hr>
    <MenuItem onclick={deletePreset}>Yes</MenuItem>
    <MenuItem href="/features/presets/{presetId}">No</MenuItem>
  </Menu>
{:else}
  <p>Loading...</p>
{/if}
