<script lang="ts">
  import { goto } from "$app/navigation";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { page } from "$app/state";
  import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import MaintenanceProfile from "$entities/MaintenanceProfile";

  const profileId = $derived(page.params.id);
  const targetProfile = $derived<MaintenanceProfile | null>(
    $maintenanceProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (!targetProfile) {
      goto('/features/maintenance');
    }
  });

  async function deleteProfile() {
    if (!targetProfile) {
      console.warn('Attempting to delete the profile, but the profile is not loaded yet.');
      return;
    }

    await targetProfile.delete();
    await goto('/features/maintenance');
  }
</script>

<Menu>
  <MenuItem href="/features/maintenance/{profileId}" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if targetProfile}
  <p>
    Do you want to remove profile "{targetProfile.settings.name}"? This action is irreversible.
  </p>
  <Menu>
    <hr>
    <MenuItem onclick={deleteProfile}>Yes</MenuItem>
    <MenuItem href="/features/maintenance/{profileId}">No</MenuItem>
  </Menu>
{:else}
  <p>Loading...</p>
{/if}
