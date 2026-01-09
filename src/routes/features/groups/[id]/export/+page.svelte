<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import TagGroup from "$entities/TagGroup";
  import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
  import { tagGroups } from "$stores/entities/tag-groups";
  import { popupTitle } from "$stores/popup";

  let isEncodedGroupShown = $state(true);

  const groupId = $derived<string>(page.params.id);
  const group = $derived<TagGroup | undefined>($tagGroups.find(group => group.id === groupId));

  $effect(() => {
    if (!group) {
      goto('/features/groups');
    } else {
      $popupTitle = `Export Tag Group: ${group.settings.name}`;
    }
  });

  const groupTransporter = new EntitiesTransporter(TagGroup);

  let rawExportedGroup = $derived<string>(group ? groupTransporter.exportToJSON(group) : '');
  let encodedExportedGroup = $derived<string>(group ? groupTransporter.exportToCompressedJSON(group) : '');
  let selectedExportString = $derived<string>(isEncodedGroupShown ? encodedExportedGroup : rawExportedGroup);

  function toggleEncoding() {
    isEncodedGroupShown = !isEncodedGroupShown;
  }
</script>

<Menu>
  <MenuItem href="/features/groups/{groupId}" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl label="Export string">
    <textarea readonly rows="6">{selectedExportString}</textarea>
  </FormControl>
</FormContainer>
<Menu>
  <hr>
  <MenuItem onclick={toggleEncoding}>
    Switch Format:
    {#if isEncodedGroupShown}
      Base64-Encoded
    {:else}
      Raw JSON
    {/if}
  </MenuItem>
</Menu>
