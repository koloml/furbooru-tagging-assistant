<script lang="ts">
  import StorageViewer from "$components/debugging/StorageViewer.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  let pathArray = $derived.by<string[]>(() => {
    const pathString = page.params.path;

    return pathString.length ? pathString.split('/') : [];
  });

  let storageName = $derived.by<string | undefined>(() => {
    return pathArray[0];
  });

  // Copy of the array without the storage or empty string at the end.
  let normalizedPathArray = $derived.by<string[]>(() => {
    // Excludes storage name
    const resultArray = pathArray.slice(1);

    // Getting rid of trailing empty entry
    if (resultArray.length && resultArray[resultArray.length - 1] === '') {
      resultArray.pop();
    }

    return resultArray;
  });

  $effect(() => {
    if (!storageName) {
      goto("/preferences/debug/storage");
    }
  });
</script>

{#if storageName}
  <StorageViewer storage={storageName} path={normalizedPathArray}></StorageViewer>
{/if}
