<script>


  /**
   * @typedef {Object} Props
   * @property {string[]|Record<string, string>} [options]
   * @property {string|undefined} [name]
   * @property {string|undefined} [id]
   * @property {string|undefined} [value]
   */

  /** @type {Props} */
  let {
    options = [],
    name = undefined,
    id = undefined,
    value = $bindable(undefined)
  } = $props();

  /** @type {Record<string, string>} */
  const optionPairs = $state({});

  if (Array.isArray(options)) {
    for (let option of options) {
      optionPairs[option] = option;
    }
  } else if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      optionPairs[key] = options[key];
    })
  }
</script>

<select bind:value={value} {id} {name}>
  {#each Object.entries(optionPairs) as [value, label]}
    <option {value}>{label}</option>
  {/each}
</select>

<style lang="scss">
  select {
    width: 100%;
  }
</style>
