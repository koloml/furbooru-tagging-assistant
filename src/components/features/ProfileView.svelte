<script lang="ts">
  import type TaggingProfile from "$entities/TaggingProfile";
  import DetailsBlock from "$components/ui/DetailsBlock.svelte";
  import TagsList from "$components/tags/TagsList.svelte";

  interface ProfileViewProps {
    profile: TaggingProfile;
  }

  let { profile }: ProfileViewProps = $props();

  const sortedTagsList = $derived(profile.settings.tags.sort((a, b) => a.localeCompare(b)));
</script>

<DetailsBlock title="Profile">
  {profile.settings.name}
</DetailsBlock>
<DetailsBlock title="Tags">
  <TagsList tags={sortedTagsList} />
</DetailsBlock>
