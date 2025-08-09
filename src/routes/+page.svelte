<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { activeProfileStore, maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import MaintenanceProfile from "$entities/MaintenanceProfile";

  let activeProfile = $derived<MaintenanceProfile | null>(
    $maintenanceProfiles.find(profile => profile.id === $activeProfileStore) || null
  );

  function turnOffActiveProfile() {
    $activeProfileStore = null;
  }
</script>

<Menu>
  {#if activeProfile}
    <MenuCheckboxItem checked oninput={turnOffActiveProfile} href="/features/maintenance/{activeProfile.id}">
      Active Profile: {activeProfile.settings.name}
    </MenuCheckboxItem>
    <hr>
  {/if}
  <MenuItem href="/features/maintenance">Tagging Profiles</MenuItem>
  <MenuItem href="/features/groups">Tag Groups</MenuItem>
  <hr>
  <MenuItem href="/transporting">Import/Export</MenuItem>
  <MenuItem href="/preferences">Preferences</MenuItem>
  <MenuItem href="/about">About</MenuItem>
</Menu>
