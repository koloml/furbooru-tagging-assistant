<script lang="ts">
  import MenuLink from "$components/ui/menu/MenuItem.svelte";
  import type { Snippet } from "svelte";
  import type { FormEventHandler, MouseEventHandler } from "svelte/elements";

  interface MenuRadioItemProps {
    checked: boolean;
    name: string;
    value: string;
    href?: string | null;
    children?: Snippet;
    onclick?: MouseEventHandler<HTMLInputElement>;
    oninput?: FormEventHandler<HTMLInputElement>;
  }

  let {
    checked,
    name,
    value,
    href = null,
    children,
    onclick,
    oninput,
  }: MenuRadioItemProps = $props();
</script>

<MenuLink {href}>
  <input {checked} {name} {onclick} {oninput} type="radio" {value}>
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
