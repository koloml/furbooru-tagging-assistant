<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    

    

    
    /**
     * @typedef {Object} Props
     * @property {string|null} [href]
     * @property {App.IconName|null} [icon]
     * @property {App.LinkTarget|undefined} [target]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        href = null,
        icon = null,
        target = undefined,
        children
    } = $props();
</script>

<svelte:element this="{href ? 'a': 'span'}" class="menu-item" {href} {target} onclick={bubble('click')} role="link" tabindex="0">
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
