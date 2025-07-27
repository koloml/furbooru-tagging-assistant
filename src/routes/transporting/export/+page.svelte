<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import { tagGroups } from "$stores/entities/tag-groups";
  import BulkEntitiesTransporter from "$lib/extension/BulkEntitiesTransporter";
  import type StorageEntity from "$lib/extension/base/StorageEntity";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";

  const bulkTransporter = new BulkEntitiesTransporter();

  let exportAllProfiles = $state(false);
  let exportAllGroups = $state(false);

  let displayExportedString = $state(false);
  let shouldUseCompressed = $state(true);
  let compressedExport = $state('');
  let plainExport = $state('');
  let selectedExportString = $derived(shouldUseCompressed ? compressedExport : plainExport);

  const exportedEntities: Record<keyof App.EntityNamesMap, Record<string, boolean>> = $state({
    profiles: {},
    groups: {},
  });

  $effect(() => {
    if (displayExportedString) {
      const elementsToExport: StorageEntity[] = [];

      $maintenanceProfiles.forEach(profile => {
        if (exportedEntities.profiles[profile.id]) {
          elementsToExport.push(profile);
        }
      });

      $tagGroups.forEach(group => {
        if (exportedEntities.groups[group.id]) {
          elementsToExport.push(group);
        }
      });

      plainExport = bulkTransporter.exportToJSON(elementsToExport);
      compressedExport = bulkTransporter.exportToCompressedJSON(elementsToExport);
    }
  });

  function refreshAreAllEntitiesChecked() {
    requestAnimationFrame(() => {
      exportAllProfiles = $maintenanceProfiles.every(profile => exportedEntities.profiles[profile.id]);
      exportAllGroups = $tagGroups.every(group => exportedEntities.groups[group.id]);
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
            $maintenanceProfiles.forEach(profile => exportedEntities.profiles[profile.id] = exportAllProfiles);
            break;
          case "groups":
            $tagGroups.forEach(group => exportedEntities.groups[group.id] = exportAllGroups);
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
    {#if $maintenanceProfiles.length}
      <MenuCheckboxItem bind:checked={exportAllProfiles} oninput={createToggleAllOnUserInput('profiles')}>
        Export All Profiles
      </MenuCheckboxItem>
      {#each $maintenanceProfiles as profile}
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
