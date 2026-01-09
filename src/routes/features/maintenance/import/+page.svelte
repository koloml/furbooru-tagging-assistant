<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import MaintenanceProfile from "$entities/MaintenanceProfile";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import ProfileView from "$components/features/ProfileView.svelte";
  import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import { goto } from "$app/navigation";
  import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
  import { popupTitle } from "$stores/popup";

  const profilesTransporter = new EntitiesTransporter(MaintenanceProfile);

  let importedString = $state('');
  let errorMessage = $state('');

  let candidateProfile = $state<MaintenanceProfile | null>(null);
  let existingProfile = $state<MaintenanceProfile | null>(null);

  $effect(() => {
    $popupTitle = candidateProfile
      ? 'Confirm Imported Tagging Profile'
      : 'Import Tagging Profile';
  })
  function tryImportingProfile() {
    candidateProfile = null;
    existingProfile = null;

    errorMessage = '';
    importedString = importedString.trim();

    if (!importedString) {
      errorMessage = 'Nothing to import.';
      return;
    }

    try {
      if (importedString.trim().startsWith('{')) {
        candidateProfile = profilesTransporter.importFromJSON(importedString);
      } else {
        candidateProfile = profilesTransporter.importFromCompressedJSON(importedString)
      }
    } catch (error) {
      errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';
    }

    if (candidateProfile) {
      existingProfile = $maintenanceProfiles.find(profile => profile.id === candidateProfile?.id) ?? null;
    }
  }

  function saveProfile() {
    if (!candidateProfile) {
      return;
    }

    candidateProfile.save().then(() => {
      goto(`/features/maintenance`);
    });
  }

  function cloneAndSaveProfile() {
    if (!candidateProfile) {
      return;
    }

    const clonedProfile = new MaintenanceProfile(crypto.randomUUID(), candidateProfile.settings);
    clonedProfile.settings.name += ` (Clone ${new Date().toISOString()})`;
    clonedProfile.save().then(() => {
      goto(`/features/maintenance`);
    });
  }
</script>

<Menu>
  <MenuItem href="/features/maintenance" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if errorMessage}
  <p class="error">Failed to import: {errorMessage}</p>
  <Menu>
    <hr>
  </Menu>
{/if}
{#if !candidateProfile}
  <FormContainer>
    <FormControl label="Import string">
      <textarea bind:value={importedString} rows="6"></textarea>
    </FormControl>
  </FormContainer>
  <Menu>
    <hr>
    <MenuItem onclick={tryImportingProfile}>Import</MenuItem>
  </Menu>
{:else}
  {#if existingProfile}
    <p class="warning">
      This profile will replace the existing "{existingProfile.settings.name}" profile, since it have the same ID.
    </p>
  {/if}
  <ProfileView profile={candidateProfile}></ProfileView>
  <Menu>
    <hr>
    {#if existingProfile}
      <MenuItem onclick={saveProfile}>Replace Existing Profile</MenuItem>
      <MenuItem onclick={cloneAndSaveProfile}>Save as New Profile</MenuItem>
    {:else}
      <MenuItem onclick={saveProfile}>Import New Profile</MenuItem>
    {/if}
    <MenuItem onclick={() => candidateProfile = null}>Cancel</MenuItem>
  </Menu>
{/if}

<style lang="scss">
  @use '$styles/colors';

  .error, .warning {
    padding: 5px 24px;
    margin: {
      left: -24px;
      right: -24px;
    }
  }

  .error {
    background: colors.$error-background;
  }

  .warning {
    background: colors.$warning-background;
    margin-bottom: .5em;
  }
</style>
