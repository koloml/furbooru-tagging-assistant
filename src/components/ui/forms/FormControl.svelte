<script lang="ts">
  import type { Snippet } from "svelte";

  interface FormControlProps {
    label?: string;
    children?: Snippet;
  }

  let {
    label = undefined,
    children
  }: FormControlProps = $props();
</script>

<label class="control">
  {#if label}
    <div class="label">{label}</div>
  {/if}
  {@render children?.()}
</label>

<style lang="scss">
  .label {
    margin-bottom: .5em;
  }

  .control {
    padding: 5px 0;

    :global(textarea) {
      width: 100%;
      resize: vertical;
    }
  }
</style>
