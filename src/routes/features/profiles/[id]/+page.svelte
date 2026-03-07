<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { activeTaggingProfile, taggingProfiles } from "$stores/entities/tagging-profiles";
  import ProfileView from "$components/features/ProfileView.svelte";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import TaggingProfile from "$entities/TaggingProfile";
  import { popupTitle } from "$stores/popup";

  let profileId = $derived(page.params.id);
  let profile = $derived<TaggingProfile|null>(
    $taggingProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (profileId === 'new') {
      goto('/features/profiles/new/edit');
      return;
    }

    if (!profile) {
      console.warn(`Profile ${profileId} not found.`);
      goto('/features/profiles');
    } else {
      $popupTitle = `Tagging Profile: ${profile.settings.name}`;
    }
  });

  let isActiveProfile = $state(false);

  $effect.pre(() => {
    isActiveProfile = $activeTaggingProfile === profileId;
  });

  $effect(() => {
    if (isActiveProfile && $activeTaggingProfile !== profileId) {
      $activeTaggingProfile = profileId;
    }

    if (!isActiveProfile && $activeTaggingProfile === profileId) {
      $activeTaggingProfile = null;
    }
  });
</script>

<Menu>
  <MenuItem href="/features/profiles" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if profile}
  <ProfileView {profile}/>
{/if}
<Menu>
  <hr>
  <MenuItem href="/features/profiles/{profileId}/edit" icon="wrench">Edit Profile</MenuItem>
  <MenuCheckboxItem bind:checked={isActiveProfile}>
    Activate Profile
  </MenuCheckboxItem>
  <MenuItem href="/features/profiles/{profileId}/export" icon="file-export">
    Export Profile
  </MenuItem>
  <MenuItem href="/features/profiles/{profileId}/delete" icon="trash">
    Delete Profile
  </MenuItem>
</Menu>

<style lang="scss">
</style>
