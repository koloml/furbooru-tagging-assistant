<script>
  import { run } from 'svelte/legacy';
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import MenuRadioItem from "$components/ui/menu/MenuRadioItem.svelte";
  import { activeProfileStore, maintenanceProfiles } from "$stores/entities/maintenance-profiles";

  /** @type {import('$entities/MaintenanceProfile').default[]} */
  let profiles = $state([]);

  run(() => {
    profiles = $maintenanceProfiles.sort((a, b) => a.settings.name.localeCompare(b.settings.name));
  });

  function resetActiveProfile() {
    $activeProfileStore = null;
  }

  /**
   * @param {Event} event
   */
  function enableSelectedProfile(event) {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.checked) {
      activeProfileStore.set(target.value);
    }
  }
</script>

<Menu>
  <MenuItem href="/" icon="arrow-left">Back</MenuItem>
  <MenuItem href="/features/maintenance/new/edit" icon="plus">Create New</MenuItem>
  {#if profiles.length}
    <hr>
  {/if}
  {#each profiles as profile}
    <MenuRadioItem href="/features/maintenance/{profile.id}"
                   name="active-profile"
                   value="{profile.id}"
                   checked="{$activeProfileStore === profile.id}"
                   on:input={enableSelectedProfile}>
      {profile.settings.name}
    </MenuRadioItem>
  {/each}
  <hr>
  <MenuItem href="#" on:click={resetActiveProfile}>Reset Active Profile</MenuItem>
  <MenuItem href="/features/maintenance/import">Import Profile</MenuItem>
</Menu>
