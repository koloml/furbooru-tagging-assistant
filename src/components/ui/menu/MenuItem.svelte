<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";

  interface MenuItemProps {
    href?: string | null;
    icon?: App.IconName | null;
    target?: App.LinkTarget | undefined;
    children?: Snippet;
    onclick?: MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
  }

  let {
    href = null,
    icon = null,
    target = undefined,
    children,
    onclick
  }: MenuItemProps = $props();
</script>

<svelte:element class="menu-item" {href} {onclick} role="link" tabindex="0" {target} this="{href ? 'a': 'span'}">
  {#if icon}
    <i class="icon icon-{icon}"></i>
  {/if}
  {@render children?.()}
</svelte:element>

<style lang="scss">
  @use '$styles/colors';

  .menu-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;

    i {
      width: 16px;
      height: 16px;
      background: colors.$text;
      margin-right: 6px;
    }
  }
</style>
