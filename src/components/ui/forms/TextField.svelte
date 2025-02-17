<script lang="ts">
  interface TextFieldProps {
    name?: string;
    placeholder?: string;
    value?: string;
  }

  let {
    name = undefined,
    placeholder = undefined,
    value = $bindable('')
  }: TextFieldProps = $props();
</script>

<input bind:value={value} {name} {placeholder} type="text">

<style lang="scss">
  :global(.control) input {
    width: 100%;
  }
</style>
