<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import TagsColorContainer from "$components/tags/TagsColorContainer.svelte";
  import FormContainer from "$components/ui/forms/FormContainer.svelte";
  import FormControl from "$components/ui/forms/FormControl.svelte";
  import TagCategorySelectField from "$components/ui/forms/TagCategorySelectField.svelte";
  import TextField from "$components/ui/forms/TextField.svelte";
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import TagsEditor from "$components/tags/TagsEditor.svelte";
  import TagGroup from "$entities/TagGroup";
  import { tagGroups } from "$stores/entities/tag-groups";

  let groupId = $derived(page.params.id);

  let targetGroup = $derived.by<TagGroup | null>(() => {
    if (groupId === 'new') {
      return new TagGroup(crypto.randomUUID(), {});
    }

    return $tagGroups.find(group => group.id === groupId) || null;
  });

  let groupName = $state<string>('');
  let tagsList = $state<string[]>([]);
  let prefixesList = $state<string[]>([]);
  let suffixesList = $state<string[]>([]);
  let tagCategory = $state<string>('');

  $effect(() => {
    if (groupId === 'new') {
      return;
    }

    if (!targetGroup) {
      goto('/features/groups');
      return;
    }

    groupName = targetGroup.settings.name;
    tagsList = [...targetGroup.settings.tags].sort((a, b) => a.localeCompare(b));
    prefixesList = [...targetGroup.settings.prefixes].sort((a, b) => a.localeCompare(b));
    suffixesList = [...targetGroup.settings.suffixes].sort((a, b) => a.localeCompare(b));
    tagCategory = targetGroup.settings.category;
  });

  async function saveGroup() {
    if (!targetGroup) {
      console.warn('Attempting to save group, but group is not loaded yet.');
      return;
    }

    targetGroup.settings.name = groupName;
    targetGroup.settings.tags = [...tagsList];
    targetGroup.settings.prefixes = [...prefixesList];
    targetGroup.settings.suffixes = [...suffixesList];
    targetGroup.settings.category = tagCategory;

    await targetGroup.save();
    await goto(`/features/groups/${targetGroup.id}`);
  }

  function mapPrefixNames(tagName: string): string {
    return `${tagName}*`;
  }

  function mapSuffixNames(tagName: string): string {
    return `*${tagName}`;
  }
</script>

<Menu>
  <MenuItem href="/features/groups/{groupId}" icon="arrow-left">Back</MenuItem>
  <hr>
</Menu>
<FormContainer>
  <FormControl label="Group Name">
    <TextField bind:value={groupName} placeholder="Group Name"></TextField>
  </FormControl>
  <FormControl label="Group Color">
    <TagCategorySelectField bind:value={tagCategory}/>
  </FormControl>
  <TagsColorContainer targetCategory={tagCategory}>
    <FormControl label="Tags">
      <TagsEditor bind:tags={tagsList}/>
    </FormControl>
  </TagsColorContainer>
  <TagsColorContainer targetCategory={tagCategory}>
    <FormControl label="Tag Prefixes">
      <TagsEditor bind:tags={prefixesList} mapTagNames={mapPrefixNames}/>
    </FormControl>
  </TagsColorContainer>
  <TagsColorContainer targetCategory={tagCategory}>
    <FormControl label="Tag Suffixes">
      <TagsEditor bind:tags={suffixesList} mapTagNames={mapSuffixNames}/>
    </FormControl>
  </TagsColorContainer>
</FormContainer>
<Menu>
  <hr>
  <MenuItem onclick={saveGroup}>Save Group</MenuItem>
</Menu>
