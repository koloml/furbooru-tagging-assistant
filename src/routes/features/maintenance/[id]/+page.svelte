<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { activeProfileStore, maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import ProfileView from "$components/features/ProfileView.svelte";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import MaintenanceProfile from "$entities/MaintenanceProfile";
  import { permalinks } from "$lib/extension/EntityPermalinks";

  const profilePermalinks = permalinks.profiles;

  let profileId = $derived(page.params.id);
  let profile = $derived<MaintenanceProfile|null>(
    $maintenanceProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (profileId === 'new') {
      goto(profilePermalinks.edit('new'));
      return;
    }

    if (!profile) {
      console.warn(`Profile ${profileId} not found.`);
      goto(profilePermalinks.list());
    }
  });

  let isActiveProfile = $state(false);

  $effect.pre(() => {
    isActiveProfile = $activeProfileStore === profileId;
  });

  $effect(() => {
    if (isActiveProfile && $activeProfileStore !== profileId) {
      $activeProfileStore = profileId;
    }

    if (!isActiveProfile && $activeProfileStore === profileId) {
      $activeProfileStore = null;
    }
  });
</script>

<Menu>
  <MenuItem href={profilePermalinks.list()} icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
{#if profile}
  <ProfileView {profile}/>
{/if}
<Menu>
  <hr>
  <MenuItem href={profilePermalinks.edit(profileId)} icon="wrench">Edit Profile</MenuItem>
  <MenuCheckboxItem bind:checked={isActiveProfile}>
    Activate Profile
  </MenuCheckboxItem>
  <MenuItem href={profilePermalinks.export(profileId)} icon="file-export">
    Export Profile
  </MenuItem>
  <MenuItem href={profilePermalinks.delete(profileId)} icon="trash">
    Delete Profile
  </MenuItem>
</Menu>

<style lang="scss">
</style>
