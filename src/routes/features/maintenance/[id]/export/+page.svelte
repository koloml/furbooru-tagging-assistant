<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { maintenanceProfiles } from "$stores/entities/maintenance-profiles";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
  import MaintenanceProfile from "$entities/MaintenanceProfile";
  import { popupTitle } from "$stores/popup";

  let isCompressedProfileShown = $state(true);

  const profileId = $derived(page.params.id);
  const profile = $derived<MaintenanceProfile | null>(
    $maintenanceProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (!profile) {
      goto('/features/maintenance/');
    } else {
      $popupTitle = `Export Tagging Profile: ${profile.settings.name}`;
    }
  });

  const profilesTransporter = new EntitiesTransporter(MaintenanceProfile);

  let rawExportedProfile = $derived(profile ? profilesTransporter.exportToJSON(profile) : '');
  let compressedExportedProfile = $derived(profile ? profilesTransporter.exportToCompressedJSON(profile) : '');
  let selectedExportString = $derived(isCompressedProfileShown ? compressedExportedProfile : rawExportedProfile);
</script>

<Menu>
  <MenuItem href="/features/maintenance/{profileId}" icon="arrow-left">
    Back
  </MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl label="Export string">
    <textarea readonly rows="6">{selectedExportString}</textarea>
  </FormControl>
</FormContainer>
<Menu>
  <hr>
  <MenuItem onclick={() => isCompressedProfileShown = !isCompressedProfileShown}>
    Switch Format:
    {#if isCompressedProfileShown}
      Base64-Encoded
    {:else}
      Raw JSON
    {/if}
  </MenuItem>
</Menu>
