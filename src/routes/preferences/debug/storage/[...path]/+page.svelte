<script>
    import { run } from 'svelte/legacy';

    import StorageViewer from "$components/debugging/StorageViewer.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let pathString = $state('');
    /** @type {string[]} */
    let pathArray = $state([]);
    /** @type {string|undefined} */
    let storageName = $state(void 0);

    run(() => {
        pathString = $page.params.path;
        pathArray = pathString.length ? pathString.split("/") : [];
        storageName = pathArray.shift()

        if (pathArray.length && pathArray[pathArray.length - 1] === '') {
            pathArray.pop();
        }

        if (!storageName) {
            goto("/preferences/debug/storage");
        }
    });
</script>

{#if storageName}
    <StorageViewer storage="{storageName}" path="{pathArray}"></StorageViewer>
{/if}
