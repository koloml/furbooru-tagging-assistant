<script>
    

    
    /**
     * @typedef {Object} Props
     * @property {string|undefined} [name]
     * @property {boolean} checked
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { name = undefined, checked = $bindable(), children } = $props();
</script>

<input type="checkbox" {name} bind:checked={checked}>
<span>
    {@render children?.()}
</span>
