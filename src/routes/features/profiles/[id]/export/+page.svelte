<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { taggingProfiles } from "$stores/entities/tagging-profiles";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
  import TaggingProfile from "$entities/TaggingProfile";
  import { popupTitle } from "$stores/popup";

  let isCompressedProfileShown = $state(true);

  const profileId = $derived(page.params.id);
  const profile = $derived<TaggingProfile | null>(
    $taggingProfiles.find(profile => profile.id === profileId) || null
  );

  $effect(() => {
    if (!profile) {
      goto('/features/profiles/');
    } else {
      $popupTitle = `Export Tagging Profile: ${profile.settings.name}`;
    }
  });

  const profilesTransporter = new EntitiesTransporter(TaggingProfile);

  let rawExportedProfile = $derived(profile ? profilesTransporter.exportToJSON(profile) : '');
  let compressedExportedProfile = $derived(profile ? profilesTransporter.exportToCompressedJSON(profile) : '');
  let selectedExportString = $derived(isCompressedProfileShown ? compressedExportedProfile : rawExportedProfile);
</script>

<Menu>
  <MenuItem href="/features/profiles/{profileId}" icon="arrow-left">
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
