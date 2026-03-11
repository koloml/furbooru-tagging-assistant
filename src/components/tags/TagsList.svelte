<script lang="ts">
  interface TagsListProps {
    tags: string[];
  }

  let { tags }: TagsListProps = $props();
</script>

<div class="tags-list">
  {#each tags as tagName}
    <div class="tag">{tagName}</div>
  {/each}
</div>

<style lang="scss">
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
</style>
