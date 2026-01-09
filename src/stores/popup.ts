import { derived, writable } from "svelte/store";
import { PLUGIN_NAME } from "$lib/constants";

/**
 * Store containing the name of the subpage. This name will be added to the title alongside the name of the plugin.
 */
export const popupTitle = writable<string | null>(null);

/**
 * Name of the current route with the name of the plugin appended to it.
 */
export const headTitle = derived(
  popupTitle,
  $popupTitle => ($popupTitle ? `${$popupTitle} | ` : '') + PLUGIN_NAME
);
