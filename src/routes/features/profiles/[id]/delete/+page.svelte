<script lang="ts">
  import { goto } from "$app/navigation";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { page } from "$app/state";
  import { taggingProfiles } from "$stores/entities/tagging-profiles";
  import TaggingProfile from "$entities/TaggingProfile";
  import { popupTitle } from "$stores/popup";

  const profileId = $derived(page.params.id);
  const targetProfile = $derived<TaggingProfile | null>(
    $taggingProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (!targetProfile) {
      goto('/features/profiles');
    } else {
      $popupTitle = `Deleting Tagging Profile: ${targetProfile.settings.name}`
    }
  });

  async function deleteProfile() {
    if (!targetProfile) {
      console.warn('Attempting to delete the profile, but the profile is not loaded yet.');
      return;
    }

    await targetProfile.delete();
    await goto('/features/profiles');
  }
</script>

<Menu>
  <MenuItem href="/features/profiles/{profileId}" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if targetProfile}
  <p>
    Do you want to remove profile "{targetProfile.settings.name}"? This action is irreversible.
  </p>
  <Menu>
    <hr>
    <MenuItem onclick={deleteProfile}>Yes</MenuItem>
    <MenuItem href="/features/profiles/{profileId}">No</MenuItem>
  </Menu>
{:else}
  <p>Loading...</p>
{/if}
