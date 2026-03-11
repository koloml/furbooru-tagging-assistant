<script lang="ts">
  import { page } from "$app/state";
  import TagEditorPreset from "$entities/TagEditorPreset";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";
  import { goto } from "$app/navigation";
  import { popupTitle } from "$stores/popup";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import PresetView from "$components/features/PresetView.svelte";

  let presetId = $derived(page.params.id);
  let preset = $derived<TagEditorPreset|null>(
    $tagEditorPresets.find(preset => preset.id === presetId) || null
  );

  $effect(() => {
    if (presetId === 'new') {
      goto(`/features/presets/new/edit`);
      return;
    }

    if (!preset) {
      console.warn(`Preset ${presetId} not found.`);
      goto('/features/presets');
    } else {
      $popupTitle = `Preset: ${preset.settings.name}`;
    }
  });
</script>

<Menu>
  <MenuItem href="/features/presets" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if preset}
  <PresetView {preset}></PresetView>
{/if}
<Menu>
  <hr>
  <MenuItem href="/features/presets/{presetId}/edit" icon="wrench">Edit Preset</MenuItem>
  <MenuItem href="/features/presets/{presetId}/delete">Delete Preset</MenuItem>
</Menu>
