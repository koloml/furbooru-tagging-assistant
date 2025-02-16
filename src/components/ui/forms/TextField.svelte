<script>


  /**
   * @typedef {Object} Props
   * @property {string|undefined} [name]
   * @property {string|undefined} [placeholder]
   * @property {string} [value]
   */

  /** @type {Props} */
  let { name = undefined, placeholder = undefined, value = $bindable('') } = $props();
</script>

<input bind:value={value} {name} {placeholder} type="text">

<style lang="scss">
  :global(.control) input {
    width: 100%;
  }
</style>
