<script lang="ts">
  interface MessageProps {
    children?: import('svelte').Snippet;
    level: 'warning' | 'error';
  }

  let { children, level }: MessageProps = $props();
</script>

<p class="{level}">
  {@render children?.()}
</p>

<style lang="scss">
  @use '$styles/colors';

  p {
    padding: 5px 24px;
    margin: {
      left: -24px;
      right: -24px;
    }
  }

  .warning {
    background: colors.$warning-background;
  }

  .error {
    background: colors.$error-background;
  }
</style>
