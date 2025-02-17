<script lang="ts">
  type SelectFieldOptionsObject = Record<string, string>;

  interface SelectFieldProps {
    options?: string[] | SelectFieldOptionsObject;
    name?: string;
    id?: string;
    value?: string;
  }

  let {
    options = [],
    name = undefined,
    id = undefined,
    value = $bindable(undefined)
  }: SelectFieldProps = $props();

  const optionPairs = $derived.by<SelectFieldOptionsObject>(() => {
    const resultPairs: SelectFieldOptionsObject = {};

    if (Array.isArray(options)) {
      for (let optionName of options) {
        resultPairs[optionName] = optionName;
      }
    } else if (options && typeof options === 'object') {
      Object.keys(options).forEach(optionKey => {
        resultPairs[optionKey] = options[optionKey];
      })
    }

    return resultPairs;
  });
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
