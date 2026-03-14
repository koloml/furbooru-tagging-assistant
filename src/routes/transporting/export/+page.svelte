<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { taggingProfiles } from "$stores/entities/tagging-profiles";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import BulkEntitiesTransporter from "$lib/extension/BulkEntitiesTransporter";
  import type StorageEntity from "$lib/extension/base/StorageEntity";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import { popupTitle } from "$stores/popup";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";

  const bulkTransporter = new BulkEntitiesTransporter();

  let exportAllProfiles = $state(false);
  let exportAllGroups = $state(false);
  let exportAllPresets = $state(false);

  let displayExportedString = $state(false);
  let shouldUseCompressed = $state(true);
  let compressedExport = $state('');
  let plainExport = $state('');
  let selectedExportString = $derived(shouldUseCompressed ? compressedExport : plainExport);

  const exportedEntities: Record<keyof App.EntityNamesMap, Record<string, boolean>> = $state({
    profiles: {},
    groups: {},
    presets: {},
  });

  $effect(() => {
    if (displayExportedString) {
      const elementsToExport: StorageEntity[] = [];

      $taggingProfiles.forEach(profile => {
        if (exportedEntities.profiles[profile.id]) {
          elementsToExport.push(profile);
        }
      });

      $tagGroups.forEach(group => {
        if (exportedEntities.groups[group.id]) {
          elementsToExport.push(group);
        }
      });

      $tagEditorPresets.forEach(preset => {
        if (exportedEntities.presets[preset.id]) {
          elementsToExport.push(preset);
        }
      });

      plainExport = bulkTransporter.exportToJSON(elementsToExport);
      compressedExport = bulkTransporter.exportToCompressedJSON(elementsToExport);
    }
  });

  $effect(() => {
    $popupTitle = displayExportedString
      ? 'Exported String'
      : 'Select Entities to Export';
  });

  function refreshAreAllEntitiesChecked() {
    requestAnimationFrame(() => {
      exportAllProfiles = $taggingProfiles.every(profile => exportedEntities.profiles[profile.id]);
      exportAllGroups = $tagGroups.every(group => exportedEntities.groups[group.id]);
      exportAllPresets = $tagEditorPresets.every(preset => exportedEntities.presets[preset.id]);
    });
  }

  /**
   * Create a handler to toggle on or off specific entity type.
   * @param targetEntity Code of the entity.
   */
  function createToggleAllOnUserInput(targetEntity: keyof App.EntityNamesMap) {
    return () => {
      requestAnimationFrame(() => {
        switch (targetEntity) {
          case "profiles":
            $taggingProfiles.forEach(profile => exportedEntities.profiles[profile.id] = exportAllProfiles);
            break;
          case "groups":
            $tagGroups.forEach(group => exportedEntities.groups[group.id] = exportAllGroups);
            break;
          case "presets":
            $tagEditorPresets.forEach(preset => exportedEntities.presets[preset.id] = exportAllPresets);
            break;
          default:
            console.warn(`Trying to toggle unsupported entity type: ${targetEntity}`);
        }
      });
    }
  }

  function toggleExportedStringDisplay() {
    displayExportedString = !displayExportedString;
  }

  function toggleExportedStringType() {
    shouldUseCompressed = !shouldUseCompressed;
  }
</script>

{#if !displayExportedString}
  <Menu>
    <MenuItem href="/transporting" icon="arrow-left">Back</MenuItem>
    <hr>
    {#if $taggingProfiles.length}
      <MenuCheckboxItem bind:checked={exportAllProfiles} oninput={createToggleAllOnUserInput('profiles')}>
        Export All Profiles
      </MenuCheckboxItem>
      {#each $taggingProfiles as profile}
        <MenuCheckboxItem bind:checked={exportedEntities.profiles[profile.id]} oninput={refreshAreAllEntitiesChecked}>
          Profile: {profile.settings.name}
        </MenuCheckboxItem>
      {/each}
      <hr>
    {/if}
    {#if $tagGroups.length}
      <MenuCheckboxItem bind:checked={exportAllGroups} oninput={createToggleAllOnUserInput('groups')}>
        Export All Groups
      </MenuCheckboxItem>
      {#each $tagGroups as group}
        <MenuCheckboxItem bind:checked={exportedEntities.groups[group.id]} oninput={refreshAreAllEntitiesChecked}>
          Group: {group.settings.name}
        </MenuCheckboxItem>
      {/each}
      <hr>
    {/if}
    {#if $tagEditorPresets.length}
      <MenuCheckboxItem bind:checked={exportAllPresets} oninput={createToggleAllOnUserInput('presets')}>
        Export All Presets
      </MenuCheckboxItem>
      {#each $tagEditorPresets as preset}
        <MenuCheckboxItem bind:checked={exportedEntities.presets[preset.id]} oninput={refreshAreAllEntitiesChecked}>
          Preset: {preset.settings.name}
        </MenuCheckboxItem>
      {/each}
      <hr>
    {/if}
    <MenuItem icon="file-export" onclick={toggleExportedStringDisplay}>Export Selected</MenuItem>
  </Menu>
{:else}
  <Menu>
    <MenuItem onclick={toggleExportedStringDisplay} icon="arrow-left">Back to Selection</MenuItem>
    <hr>
  </Menu>
  <FormContainer>
    <FormControl label="Export string">
      <textarea readonly rows="6">{selectedExportString}</textarea>
    </FormControl>
  </FormContainer>
  <Menu>
    <hr>
    <MenuItem onclick={toggleExportedStringType}>
      Switch Format:
      {#if shouldUseCompressed}
        Base64-Encoded
      {:else}
        Raw JSON
      {/if}
    </MenuItem>
  </Menu>
{/if}
