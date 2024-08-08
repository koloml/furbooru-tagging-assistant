import {writable} from "svelte/store";
import SearchSettings from "$lib/extension/settings/SearchSettings.js";

export const searchPropertiesSuggestionsEnabled = writable(false);

/** @type {import('svelte/store').Writable<"start"|"end">} */
export const searchPropertiesSuggestionsPosition = writable('start');

const searchSettings = new SearchSettings();

Promise.allSettled([
  // First we wait for all properties to load and save
  searchSettings.resolvePropertiesSuggestionsEnabled().then(v => searchPropertiesSuggestionsEnabled.set(v)),
  searchSettings.resolvePropertiesSuggestionsPosition().then(v => searchPropertiesSuggestionsPosition.set(v))
]).then(() => {
  // And then we can start reading value changes from the writable objects
  searchPropertiesSuggestionsEnabled.subscribe(value => {
    void searchSettings.setPropertiesSuggestions(value);
  });

  searchPropertiesSuggestionsPosition.subscribe(value => {
    void searchSettings.setPropertiesSuggestionsPosition(value);
  });
})
