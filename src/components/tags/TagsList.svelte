<script lang="ts">
  interface TagsListProps {
    tags: string[];
    prepend?: string;
    append?: string;
  }

  let { tags, prepend, append }: TagsListProps = $props();
</script>

<div class="tags-list">
  {#each tags as tagName}
    <div class="tag">{prepend || ''}{tagName}{append || ''}</div>
  {/each}
</div>

<style lang="scss">
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
</style>
