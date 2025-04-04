<script>
  import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { stripBlacklistedTagsEnabled } from "$stores/preferences/maintenance";
  import { shouldSeparateTagGroups } from "$stores/preferences/tag";
</script>

<Menu>
  <MenuItem href="/preferences" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl>
    <CheckboxField bind:checked={$stripBlacklistedTagsEnabled}>
      Automatically remove black-listed tags from the images
    </CheckboxField>
  </FormControl>
  <FormControl>
    <CheckboxField bind:checked={$shouldSeparateTagGroups}>
      Enable separation of custom tag groups on the image pages
    </CheckboxField>
  </FormControl>
</FormContainer>
