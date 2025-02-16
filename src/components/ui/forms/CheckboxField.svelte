<script>


  /**
   * @typedef {Object} Props
   * @property {string|undefined} [name]
   * @property {boolean} checked
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { name = undefined, checked = $bindable(), children } = $props();
</script>

<input bind:checked={checked} {name} type="checkbox">
<span>
    {@render children?.()}
</span>
