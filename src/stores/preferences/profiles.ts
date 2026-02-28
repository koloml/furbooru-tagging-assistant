import { writable } from "svelte/store";
import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";

export const stripBlacklistedTagsEnabled = writable(true);

const preferences = new TaggingProfilesPreferences();

Promise
  .all([
    preferences.resolveStripBlacklistedTags().then(v => stripBlacklistedTagsEnabled.set(v ?? true))
  ])
  .then(() => {
    preferences.subscribe(settings => {
      stripBlacklistedTagsEnabled.set(typeof settings.stripBlacklistedTags === 'boolean' ? settings.stripBlacklistedTags : true);
    });

    stripBlacklistedTagsEnabled.subscribe(v => preferences.setStripBlacklistedTags(v));
  });
