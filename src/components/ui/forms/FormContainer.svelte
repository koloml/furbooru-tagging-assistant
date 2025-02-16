<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
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
