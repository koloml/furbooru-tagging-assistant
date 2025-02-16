<script>
  import { createBubbler, stopPropagation } from 'svelte/legacy';
  import MenuLink from "$components/ui/menu/MenuItem.svelte";

  const bubble = createBubbler();


  /**
   * @typedef {Object} Props
   * @property {boolean} checked
   * @property {string} name
   * @property {string} value
   * @property {string|null} [href]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    checked,
    name,
    value,
    href = null,
    children
  } = $props();
</script>

<MenuLink {href}>
  <input {checked} {name} onclick={stopPropagation(bubble('click'))} oninput={bubble('input')} type="radio" {value}>
  {@render children?.()}
</MenuLink>

<style lang="scss">
  :global(.menu-item) input {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    flex-shrink: 0;
  }
</style>
