<script lang="ts">
  import type { Snippet } from "svelte";

  interface TagColorContainerProps {
    targetCategory?: string;
    children?: Snippet;
  }

  let { targetCategory = '', children }: TagColorContainerProps = $props();
</script>

<div class="tag-color-container tag-color-container--{targetCategory || 'default'}">
  {@render children?.()}
</div>

<style lang="scss">
  @use '$styles/colors';

  .tag-color-container:is(:global(.tag-color-container--rating)) :global(.tag) {
    background-color: colors.$tag-rating-background;
    color: colors.$tag-rating-text;
    border-color: colors.$tag-rating-border;
  }

  .tag-color-container:is(:global(.tag-color-container--spoiler)) :global(.tag) {
    background-color: colors.$tag-spoiler-background;
    color: colors.$tag-spoiler-text;
    border-color: colors.$tag-spoiler-border;
  }

  .tag-color-container:is(:global(.tag-color-container--origin)) :global(.tag) {
    background-color: colors.$tag-origin-background;
    color: colors.$tag-origin-text;
    border-color: colors.$tag-origin-border;
  }

  .tag-color-container:is(:global(.tag-color-container--oc)) :global(.tag) {
    background-color: colors.$tag-oc-background;
    color: colors.$tag-oc-text;
    border-color: colors.$tag-oc-border;
  }

  .tag-color-container:is(:global(.tag-color-container--error)) :global(.tag) {
    background-color: colors.$tag-error-background;
    color: colors.$tag-error-text;
    border-color: colors.$tag-error-border;
  }

  .tag-color-container:is(:global(.tag-color-container--character)) :global(.tag) {
    background-color: colors.$tag-character-background;
    color: colors.$tag-character-text;
    border-color: colors.$tag-character-border;
  }

  .tag-color-container:is(:global(.tag-color-container--content-official)) :global(.tag) {
    background-color: colors.$tag-content-official-background;
    color: colors.$tag-content-official-text;
    border-color: colors.$tag-content-official-border;
  }

  .tag-color-container:is(:global(.tag-color-container--content-fanmade)) :global(.tag) {
    background-color: colors.$tag-content-fanmade-background;
    color: colors.$tag-content-fanmade-text;
    border-color: colors.$tag-content-fanmade-border;
  }

  .tag-color-container:is(:global(.tag-color-container--species)) :global(.tag) {
    background-color: colors.$tag-species-background;
    color: colors.$tag-species-text;
    border-color: colors.$tag-species-border;
  }

  .tag-color-container:is(:global(.tag-color-container--body-type)) :global(.tag) {
    background-color: colors.$tag-body-type-background;
    color: colors.$tag-body-type-text;
    border-color: colors.$tag-body-type-border;
  }
</style>
