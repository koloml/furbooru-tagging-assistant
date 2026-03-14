<script lang="ts">
  import TagsColorContainer from "$components/tags/TagsColorContainer.svelte";
  import type TagGroup from "$entities/TagGroup";
  import DetailsBlock from "$components/ui/DetailsBlock.svelte";
  import TagsList from "$components/tags/TagsList.svelte";

  interface GroupViewProps {
    group: TagGroup;
  }

  let { group }: GroupViewProps = $props();

  let sortedTagsList = $derived<string[]>(group.settings.tags.sort((a, b) => a.localeCompare(b))),
    sortedPrefixes = $derived<string[]>(group.settings.prefixes.sort((a, b) => a.localeCompare(b))),
    sortedSuffixes = $derived<string[]>(group.settings.suffixes.sort((a, b) => a.localeCompare(b)));

</script>

<DetailsBlock title="Group Name">
  {group.settings.name}
</DetailsBlock>
{#if sortedTagsList.length}
  <DetailsBlock title="Tags">
    <TagsColorContainer targetCategory={group.settings.category}>
      <TagsList tags={sortedTagsList} />
    </TagsColorContainer>
  </DetailsBlock>
{/if}
{#if sortedPrefixes.length}
  <DetailsBlock title="Prefixes">
    <TagsColorContainer targetCategory={group.settings.category}>
      <TagsList tags={sortedPrefixes} append="*" />
    </TagsColorContainer>
  </DetailsBlock>
{/if}
{#if sortedSuffixes.length}
  <DetailsBlock title="Suffixes">
    <TagsColorContainer targetCategory={group.settings.category}>
      <TagsList tags={sortedSuffixes} prepend="*" />
    </TagsColorContainer>
  </DetailsBlock>
{/if}
