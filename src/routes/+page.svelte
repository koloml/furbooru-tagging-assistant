<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { activeTaggingProfile, taggingProfiles } from "$stores/entities/tagging-profiles";
  import MenuCheckboxItem from "$components/ui/menu/MenuCheckboxItem.svelte";
  import TaggingProfile from "$entities/TaggingProfile";
  import { popupTitle } from "$stores/popup";

  $popupTitle = null;

  let activeProfile = $derived<TaggingProfile | null>(
    $taggingProfiles.find(profile => profile.id === $activeTaggingProfile) || null
  );

  function turnOffActiveProfile() {
    $activeTaggingProfile = null;
  }
</script>

<Menu>
  {#if activeProfile}
    <MenuCheckboxItem checked oninput={turnOffActiveProfile} href="/features/profiles/{activeProfile.id}">
      Active Profile: {activeProfile.settings.name}
    </MenuCheckboxItem>
    <hr>
  {/if}
  <MenuItem href="/features/profiles">Tagging Profiles</MenuItem>
  <MenuItem href="/features/groups">Tag Groups</MenuItem>
  <hr>
  <MenuItem href="/transporting">Import/Export</MenuItem>
  <MenuItem href="/preferences">Preferences</MenuItem>
  <MenuItem href="/about">About</MenuItem>
</Menu>
