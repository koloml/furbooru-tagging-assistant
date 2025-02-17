<script lang="ts">
  import type { Snippet } from "svelte";

  interface FormContainerProps {
    children?: Snippet;
  }

  let { children }: FormContainerProps = $props();
</script>

<form>
  {@render children?.()}
</form>

<style lang="scss">
  form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }
</style>
