<script>
  import CheckboxField from "$components/ui/forms/CheckboxField.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { stripBlacklistedTagsEnabled } from "$stores/preferences/maintenance";
  import {
    shouldReplaceLinksOnForumPosts,
    shouldReplaceTextOfTagLinks,
    shouldSeparateTagGroups
  } from "$stores/preferences/tag";
  import { popupTitle } from "$stores/popup";

  $popupTitle = 'Tagging Preferences';
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
  <FormControl>
    <CheckboxField bind:checked={$shouldReplaceLinksOnForumPosts}>
      Find and replace links to the tags in the forum posts
    </CheckboxField>
  </FormControl>
  {#if $shouldReplaceLinksOnForumPosts}
    <FormControl>
      <CheckboxField bind:checked={$shouldReplaceTextOfTagLinks}>
        Try to replace text on links pointing to tags in forum posts
      </CheckboxField>
    </FormControl>
  {/if}
</FormContainer>
