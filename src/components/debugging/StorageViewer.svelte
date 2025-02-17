<script lang="ts">
  import Menu from "$components/ui/menu/Menu.svelte";
  import MenuItem from "$components/ui/menu/MenuItem.svelte";
  import { storagesCollection } from "$stores/debug";
  import { goto } from "$app/navigation";
  import { findDeepObject } from "$lib/utils";

  interface StorageViewerProps {
    storage: string;
    path: string[];
  }

  type BreadcrumbsArray = [string, string][];

  let { storage, path }: StorageViewerProps = $props();

  let breadcrumbs = $derived.by<BreadcrumbsArray>(() => {
    return path.reduce<BreadcrumbsArray>((resultCrumbs, entry) => {
      let entryPath = entry;

      if (resultCrumbs.length) {
        entryPath = resultCrumbs[resultCrumbs.length - 1][1] + "/" + entryPath;
      }

      resultCrumbs.push([entry, entryPath]);

      return resultCrumbs;
    }, [])
  });

  let targetStorage = $derived.by<object|null>(() => {
    return $storagesCollection[storage];
  });

  let targetObject = $derived.by<Record<string, any> | null>(() => {
    return targetStorage
      ? findDeepObject(targetStorage, path)
      : null;
  });

  let targetPathString = $derived.by<string>(() => {
    let pathString = path.join("/");

    if (pathString.length) {
      pathString += "/";
    }

    return pathString;
  });

  $effect(() => {
    if (!targetStorage) {
      goto("/preferences/debug/storage");
    }
  });

  /**
   * Helper function to resolve type, including the null.
   * @param value Value to resolve type from.
   * @return Type of the value, including "null" for null.
   */
  function resolveType(value: unknown): string {
    let typeName: string = typeof value;

    if (typeName === 'object' && value === null) {
      typeName = 'null';
    }

    return typeName;
  }

  /**
   * Helper function to resolve value, including values like null or undefined.
   * @param value Value to resolve.
   * @return String representation of the value.
   */
  function resolveValue(value: unknown): string {
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
    {#each Object.entries(targetObject) as [key, _]}
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
