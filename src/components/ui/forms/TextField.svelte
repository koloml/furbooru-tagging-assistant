<script>
    

    

    
    /**
     * @typedef {Object} Props
     * @property {string|undefined} [name]
     * @property {string|undefined} [placeholder]
     * @property {string} [value]
     */

    /** @type {Props} */
    let { name = undefined, placeholder = undefined, value = $bindable('') } = $props();
</script>

<input type="text" {name} {placeholder} bind:value={value}>

<style lang="scss">
    :global(.control) input {
        width: 100%;
    }
</style>
