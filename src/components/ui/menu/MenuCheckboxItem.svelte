<script lang="ts">
  import MenuLink from "$components/ui/menu/MenuItem.svelte";
  import type { Snippet } from "svelte";
  import type { FormEventHandler, MouseEventHandler } from "svelte/elements";

  interface MenuCheckboxItemProps {
    checked: boolean;
    name?: string;
    value?: string;
    href?: string;
    children?: Snippet;
    onclick?: MouseEventHandler<HTMLInputElement>;
    oninput?: FormEventHandler<HTMLInputElement>;
  }

  let {
    checked = $bindable(),
    name = undefined,
    value = undefined,
    href = undefined,
    children,
    onclick,
    oninput,
  }: MenuCheckboxItemProps = $props();

  function stopPropagationAndPassCallback(originalEvent: MouseEvent) {
    originalEvent.stopPropagation();
    onclick?.(originalEvent as MouseEvent & { currentTarget: HTMLInputElement });
  }
</script>

<MenuLink {href}>
  <input bind:checked={checked} {name} onclick={stopPropagationAndPassCallback} {oninput} type="checkbox" {value}>
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
