<script>
    import { run } from 'svelte/legacy';

    import Menu from "$components/ui/menu/Menu.svelte";
    import MenuItem from "$components/ui/menu/MenuItem.svelte";
    import { storagesCollection } from "$stores/debug";
    import { goto } from "$app/navigation";
    import { findDeepObject } from "$lib/utils";

    

    
    /**
     * @typedef {Object} Props
     * @property {string} storage
     * @property {string[]} path
     */

    /** @type {Props} */
    let { storage, path } = $props();

    /** @type {Object|null} */
    let targetStorage = $state(null);
    /** @type {[string, string][]} */
    let breadcrumbs = $state([]);
    /** @type {Object<string, any>|null} */
    let targetObject = $state(null);
    let targetPathString = $state('');

    run(() => {
        /** @type {[string, string][]} */
        const builtBreadcrumbs = [];

        breadcrumbs = path.reduce((resultCrumbs, entry) => {
            let entryPath = entry;

            if (resultCrumbs.length) {
                entryPath = resultCrumbs[resultCrumbs.length - 1][1] + "/" + entryPath;
            }

            resultCrumbs.push([entry, entryPath]);

            return resultCrumbs;
        }, builtBreadcrumbs);

        targetPathString = path.join("/");

        if (targetPathString.length) {
            targetPathString += "/";
        }
    });

    run(() => {
        targetStorage = $storagesCollection[storage];

        if (!targetStorage) {
            goto("/preferences/debug/storage");
        }
    });

    run(() => {
        targetObject = targetStorage
                ? findDeepObject(targetStorage, path)
                : null;
    });

    /**
     * Helper function to resolve type, including the null.
     * @param {*} value Value to resolve type from.
     * @return {string} Type of the value, including "null" for null.
     */
    function resolveType(value) {
        /** @type {string} */
        let typeName = typeof value;

        if (typeName === 'object' && value === null) {
            typeName = 'null';
        }

        return typeName;
    }

    /**
     * Helper function to resolve value, including values like null or undefined.
     * @param {*} value Value to resolve.
     * @return {string} String representation of the value.
     */
    function resolveValue(value) {
        if (value === null) {
            return "null";
        }

        if (value === undefined) {
            return "undefined";
        }

        return value?.toString() ?? '';
    }
</script>

<Menu>
    <MenuItem href="/preferences/debug/storage" icon="arrow-left">Back</MenuItem>
    <hr>
</Menu>
<p class="path">
    <span>/ <a href="/preferences/debug/storage/{storage}">{storage}</a></span>
    {#each breadcrumbs as [name, entryPath]}
        <span>/ <a href="/preferences/debug/storage/{storage}/{entryPath}/">{name}</a></span>
    {/each}
</p>
{#if targetObject}
    <Menu>
        <hr>
        {#each Object.entries(targetObject) as [key, value]}
            {#if targetObject[key] && typeof targetObject[key] === 'object'}
                <MenuItem href="/preferences/debug/storage/{storage}/{targetPathString}{key}">
                    {key}: Object
                </MenuItem>
            {:else}
                <MenuItem>
                    {key}: {resolveType(targetObject[key])} = {resolveValue(targetObject[key])}
                </MenuItem>
            {/if}
        {/each}
    </Menu>
{/if}

<style lang="scss">
    .path {
        display: flex;
        flex-wrap: wrap;
        column-gap: .5em;
    }
</style>
