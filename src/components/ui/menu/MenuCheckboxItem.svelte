<script>
    import { createBubbler, stopPropagation } from 'svelte/legacy';

    const bubble = createBubbler();
    import MenuLink from "$components/ui/menu/MenuItem.svelte";

    

    

    

    
    /**
     * @typedef {Object} Props
     * @property {boolean} checked
     * @property {string|undefined} [name]
     * @property {string|undefined} [value]
     * @property {string|null} [href]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        checked = $bindable(),
        name = undefined,
        value = undefined,
        href = null,
        children
    } = $props();
</script>

<MenuLink {href}>
    <input type="checkbox" {name} {value} bind:checked={checked} oninput={bubble('input')} onclick={stopPropagation(bubble('click'))}>
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
