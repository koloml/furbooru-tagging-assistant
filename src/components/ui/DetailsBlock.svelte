<script lang="ts">
  import type { Snippet } from "svelte";

  interface DetailsBlockProps {
    title?: string;
    children?: Snippet;
  }

  let { title, children }: DetailsBlockProps = $props();
</script>

<div class="block">
  {#if title?.length}
    <strong>{title}:</strong>
  {/if}
  <div>
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  .block strong {
    display: block;
    margin-bottom: .25em;
  }

  .block + :global(.block) {
    margin-top: .5em;
  }
</style>
