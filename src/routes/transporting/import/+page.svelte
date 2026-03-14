<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import TaggingProfile from "$entities/TaggingProfile";
  import TagGroup from "$entities/TagGroup";
  import BulkEntitiesTransporter from "$lib/extension/BulkEntitiesTransporter";
  import type StorageEntity from "$lib/extension/base/StorageEntity";
  import { taggingProfiles } from "$stores/entities/tagging-profiles";
  import { tagGroups } from "$stores/entities/tag-groups";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import ProfileView from "$components/features/ProfileView.svelte";
  import GroupView from "$components/features/GroupView.svelte";
  import { goto } from "$app/navigation";
  import type { SameSiteStatus } from "$lib/extension/EntitiesTransporter";
  import { popupTitle } from "$stores/popup";
  import Notice from "$components/ui/Notice.svelte";
  import TagEditorPreset from "$entities/TagEditorPreset";
  import { tagEditorPresets } from "$stores/entities/tag-editor-presets";

  let importedString = $state('');
  let errorMessage = $state('');

  let importedProfiles = $state<TaggingProfile[]>([]);
  let importedGroups = $state<TagGroup[]>([]);
  let importedPresets = $state<TagEditorPreset[]>([]);

  let saveAllProfiles = $state(false);
  let saveAllGroups = $state(false);
  let saveAllPresets = $state(false);

  let isSaving = $state(false);

  let selectedEntities: Record<keyof App.EntityNamesMap, Record<string, boolean>> = $state({
    profiles: {},
    groups: {},
    presets: {},
  });

  let previewedEntity = $state<StorageEntity | null>(null);

  const existingProfilesMap = $derived(
    $taggingProfiles.reduce((map, profile) => {
      map.set(profile.id, profile);
      return map;
    }, new Map<string, TaggingProfile>())
  );

  const existingGroupsMap = $derived(
    $tagGroups.reduce((map, group) => {
      map.set(group.id, group);
      return map;
    }, new Map<string, TagGroup>())
  );

  const existingPresetsMap = $derived(
    $tagEditorPresets.reduce((map, preset) => {
      map.set(preset.id, preset);
      return map;
    }, new Map<string, TagEditorPreset>())
  );

  const hasImportedEntities = $derived(
    Boolean(importedProfiles.length || importedGroups.length || importedPresets.length)
  );

  $effect(() => {
    $popupTitle = hasImportedEntities
      ? (
        previewedEntity
          ? 'Preview of Imported Entity'
          : 'Select & Preview Imported Entities'
      )
      : 'Import';
  });

  const transporter = new BulkEntitiesTransporter();

  let lastImportStatus = $state<SameSiteStatus>(null);

  function tryBulkImport() {
    importedProfiles = [];
    importedGroups = [];
    importedPresets = [];
    errorMessage = '';

    importedString = importedString.trim();

    if (!importedString) {
      errorMessage = 'Nothing to import.';
      return;
    }

    let importedEntities: StorageEntity[] = [];

    try {
      if (importedString.startsWith('{')) {
        importedEntities = transporter.parseAndImportFromJSON(importedString);
      } else {
        importedEntities = transporter.parseAndImportFromCompressedJSON(importedString);
      }
    } catch (importError) {
      errorMessage = importError instanceof Error ? importError.message : 'Unknown error!';
      return;
    }

    lastImportStatus = transporter.lastImportSameSiteStatus;

    if (importedEntities.length) {
      for (const targetImportedEntity of importedEntities) {
        switch (targetImportedEntity.type) {
          case "profiles":
            importedProfiles.push(targetImportedEntity as TaggingProfile);
            break;
          case "groups":
            importedGroups.push(targetImportedEntity as TagGroup);
            break;
          case "presets":
            importedPresets.push(targetImportedEntity as TagEditorPreset);
            break;
          default:
            console.warn(`Unprocessed entity type detected: ${targetImportedEntity.type}`, targetImportedEntity);
        }
      }
    } else {
      errorMessage = "Import string contains nothing!";
    }
  }

  function cancelImport() {
    importedProfiles = [];
    importedGroups = [];
    importedPresets = [];
  }

  function refreshAreAllEntitiesChecked() {
    requestAnimationFrame(() => {
      saveAllProfiles = importedProfiles.every(profile => selectedEntities.profiles[profile.id]);
      saveAllGroups = importedGroups.every(group => selectedEntities.groups[group.id]);
      saveAllPresets = importedPresets.every(preset => selectedEntities.presets[preset.id]);
    });
  }

  function createToggleAllOnUserInput(entityType: keyof App.EntityNamesMap) {
    return () => {
      requestAnimationFrame(() => {
        switch (entityType) {
          case "profiles":
            importedProfiles.forEach(profile => selectedEntities.profiles[profile.id] = saveAllProfiles);
            break;
          case "groups":
            importedGroups.forEach(group => selectedEntities.groups[group.id] = saveAllGroups);
            break;
          case "presets":
            importedPresets.forEach(preset => selectedEntities.presets[preset.id] = saveAllPresets);
            break;
          default:
            console.warn(`Trying to toggle unsupported entity type: ${entityType}`);
        }
      });
    };
  }

  function createShowPreviewForEntity(entity: StorageEntity) {
    return (event: MouseEvent) => {
      event.preventDefault();
      previewedEntity = entity;
    }
  }

  async function saveSelectedEntities() {
    if (isSaving) {
      return;
    }

    isSaving = true;

    for (const profile of importedProfiles) {
      if (!selectedEntities.profiles[profile.id]) {
        continue;
      }

      await profile.save();
    }

    for (const group of importedGroups) {
      if (!selectedEntities.groups[group.id]) {
        continue;
      }

      await group.save();
    }

    for (const preset of importedPresets) {
      if (!selectedEntities.presets[preset.id]) {
        continue;
      }

      await preset.save();
    }

    await goto("/transporting");
  }
</script>

{#if isSaving}
  <p>Saving imported entities...</p>
{:else if !hasImportedEntities}
  <Menu>
    <MenuItem href="/transporting" icon="arrow-left">Back</MenuItem>
    <hr>
  </Menu>
  {#if errorMessage}
    <Notice level="error">{errorMessage}</Notice>
    <Menu>
      <hr>
    </Menu>
  {/if}
  <FormContainer>
    <FormControl label="Import string">
      <textarea bind:value={importedString} rows="6"></textarea>
    </FormControl>
  </FormContainer>
  <Menu>
    <hr>
    <MenuItem onclick={tryBulkImport}>Import & Preview</MenuItem>
  </Menu>
{:else if previewedEntity}
  <Menu>
    <MenuItem onclick={() => previewedEntity = null} icon="arrow-left">Back to Selection</MenuItem>
    <hr>
  </Menu>
  {#if previewedEntity instanceof TaggingProfile}
    <ProfileView profile={previewedEntity}></ProfileView>
  {:else if previewedEntity instanceof TagGroup}
    <GroupView group={previewedEntity}></GroupView>
  {/if}
{:else}
  <Menu>
    <MenuItem onclick={cancelImport} icon="arrow-left">Cancel Import</MenuItem>
    {#if lastImportStatus !== 'same'}
      <hr>
    {/if}
  </Menu>
  {#if lastImportStatus === "different"}
    <Notice level="warning">
      <b>Warning!</b>
      Looks like these entities were exported for the different extension! There are many differences between tagging
      systems of Furobooru and Derpibooru, so make sure to check if these settings are correct before using them!
    </Notice>
  {/if}
  {#if lastImportStatus === 'unknown'}
    <Notice level="warning">
      <b>Warning!</b>
      We couldn't verify if these settings are meant for this site or not. There are many differences between tagging
      systems of Furbooru and Derpibooru, so make sure to check if these settings are correct before using them.
    </Notice>
  {/if}
  <Menu>
    {#if importedProfiles.length}
      <hr>
      <MenuCheckboxItem bind:checked={saveAllProfiles} oninput={createToggleAllOnUserInput('profiles')}>
        Import All Profiles
      </MenuCheckboxItem>
      {#each importedProfiles as candidateProfile}
        <MenuCheckboxItem
          bind:checked={selectedEntities.profiles[candidateProfile.id]}
          oninput={refreshAreAllEntitiesChecked}
          onitemclick={createShowPreviewForEntity(candidateProfile)}
        >
          {#if existingProfilesMap.has(candidateProfile.id)}
            Update:
          {:else}
            New:
          {/if}
          {candidateProfile.settings.name || 'Unnamed Profile'}
        </MenuCheckboxItem>
      {/each}
    {/if}
    {#if importedGroups.length}
      <hr>
      <MenuCheckboxItem bind:checked={saveAllGroups} oninput={createToggleAllOnUserInput('groups')}>
        Import All Groups
      </MenuCheckboxItem>
      {#each importedGroups as candidateGroup}
        <MenuCheckboxItem
          bind:checked={selectedEntities.groups[candidateGroup.id]}
          oninput={refreshAreAllEntitiesChecked}
          onitemclick={createShowPreviewForEntity(candidateGroup)}
        >
          {#if existingGroupsMap.has(candidateGroup.id)}
            Update:
          {:else}
            New:
          {/if}
          {candidateGroup.settings.name || 'Unnamed Group'}
        </MenuCheckboxItem>
      {/each}
    {/if}
    {#if importedPresets.length}
      <hr>
      <MenuCheckboxItem bind:checked={saveAllPresets} oninput={createToggleAllOnUserInput('presets')}>
        Import All Presets
      </MenuCheckboxItem>
      {#each importedPresets as candidatePreset}
        <MenuCheckboxItem
          bind:checked={selectedEntities.presets[candidatePreset.id]}
          oninput={refreshAreAllEntitiesChecked}
          onitemclick={createShowPreviewForEntity(candidatePreset)}
        >
          {#if existingPresetsMap.has(candidatePreset.id)}
            Update:
          {:else}
            New:
          {/if}
          {candidatePreset.settings.name || 'Unnamed Preset'}
        </MenuCheckboxItem>
      {/each}
    {/if}
    <hr>
    <MenuItem onclick={saveSelectedEntities}>
      Imported Selected
    </MenuItem>
  </Menu>
{/if}
