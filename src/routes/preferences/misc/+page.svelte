<script>
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
  import { fullScreenViewerEnabled } from "$stores/preferences/misc";
</script>

<Menu>
  <MenuItem href="/preferences" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl>
    <CheckboxField bind:checked={$fullScreenViewerEnabled}>
      Enable fullscreen viewer button
    </CheckboxField>
  </FormControl>
</FormContainer>
