<script lang="ts">
  interface MenuProps {
    children?: import('svelte').Snippet;
  }

  let { children }: MenuProps = $props();
</script>

<nav>
  {@render children?.()}
</nav>

<style lang="scss">
  @use '$styles/colors';

  nav {
    display: flex;
    flex-direction: column;

    & > :global(.menu-item) {
      padding: 5px 24px;
    }

    :global(.menu-item) {
      color: colors.$text;

      &:hover {
        background: colors.$header-mobile-link-hover;
      }
    }

    :global(hr) {
      background: colors.$block-border;
      margin: .5em 24px;
      border: 0;
      height: 1px;
    }

    :global(main) > & {
      margin: {
        left: -24px;
        right: -24px;
      }
    }
  }
</style>
