<script lang="ts">
  import { goto } from "$app/navigation";
  import GroupView from "$components/features/GroupView.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import TagGroup from "$entities/TagGroup";
  import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
  import { tagGroups } from "$stores/entities/tag-groups";
  import { popupTitle } from "$stores/popup";
  import Notice from "$components/ui/Notice.svelte";

  const groupTransporter = new EntitiesTransporter(TagGroup);

  let importedString = $state('');
  let errorMessage = $state('');

  let candidateGroup = $state<TagGroup | null>(null);
  let existingGroup = $state<TagGroup | null>(null);

  $effect(() => {
    $popupTitle = candidateGroup
      ? 'Confirm Imported Tag Group'
      : 'Import Tag Group';
  });

  function tryImportingGroup() {
    candidateGroup = null;
    existingGroup = null;

    errorMessage = '';
    importedString = importedString.trim();

    if (!importedString) {
      errorMessage = 'Nothing to import.';
      return;
    }

    try {
      if (importedString.trim().startsWith('{')) {
        candidateGroup = groupTransporter.importFromJSON(importedString);
      } else {
        candidateGroup = groupTransporter.importFromCompressedJSON(importedString);
      }
    } catch (error) {
      errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';
    }

    if (candidateGroup) {
      existingGroup = $tagGroups.find(group => group.id === candidateGroup?.id) ?? null;
    }
  }

  function saveGroup() {
    if (!candidateGroup) {
      return;
    }

    candidateGroup.save().then(() => {
      goto(`/features/groups`);
    });
  }

  function cloneAndSaveGroup() {
    if (!candidateGroup) {
      return;
    }

    const clonedProfile = new TagGroup(crypto.randomUUID(), candidateGroup.settings);
    clonedProfile.settings.name += ` (Clone ${new Date().toISOString()})`;
    clonedProfile.save().then(() => {
      goto(`/features/groups`);
    });
  }
</script>

<Menu>
  <MenuItem href="/features/groups" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if errorMessage}
  <Notice level="error">Failed to import: {errorMessage}</Notice>
  <Menu>
    <hr>
  </Menu>
{/if}
{#if !candidateGroup}
  <FormContainer>
    <FormControl label="Import string">
      <textarea bind:value={importedString} rows="6"></textarea>
    </FormControl>
  </FormContainer>
  <Menu>
    <hr>
    <MenuItem onclick={tryImportingGroup}>Import</MenuItem>
  </Menu>
{:else}
  {#if existingGroup}
    <Notice level="warning">
      This group will replace the existing "{existingGroup.settings.name}" group, since it have the same ID.
    </Notice>
    <br>
  {/if}
  <GroupView group={candidateGroup}></GroupView>
  <Menu>
    <hr>
    {#if existingGroup}
      <MenuItem onclick={saveGroup}>Replace Existing Group</MenuItem>
      <MenuItem onclick={cloneAndSaveGroup}>Save as New Group</MenuItem>
    {:else}
      <MenuItem onclick={saveGroup}>Import New Group</MenuItem>
    {/if}
    <MenuItem onclick={() => candidateGroup = null}>Cancel</MenuItem>
  </Menu>
{/if}
