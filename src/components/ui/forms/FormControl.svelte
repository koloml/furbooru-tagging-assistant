<script>


  /**
   * @typedef {Object} Props
   * @property {string|undefined} [label]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { label = undefined, children } = $props();
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
