<script lang="ts">
  import type { Snippet } from "svelte";

  interface CheckboxFieldProps {
    name?: string;
    checked: boolean;
    children?: Snippet;
  }

  let {
    name = undefined,
    checked = $bindable(),
    children
  }: CheckboxFieldProps = $props();
</script>

<input bind:checked={checked} {name} type="checkbox">
<span>
    {@render children?.()}
</span>
