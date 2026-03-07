import { type Writable, writable } from "svelte/store";
import TaggingProfile from "$entities/TaggingProfile";
import TaggingProfilesPreferences from "$lib/extension/preferences/TaggingProfilesPreferences";

/**
 * Store for working with maintenance profiles in the Svelte popup.
 */
export const taggingProfiles: Writable<TaggingProfile[]> = writable([]);

/**
 * Store for the active maintenance profile ID.
 */
export const activeTaggingProfile: Writable<string|null> = writable(null);

const preferences = new TaggingProfilesPreferences();

/**
 * Active profile ID stored locally. Used to reset active profile once the existing profile was removed.
 */
let lastActiveProfileId: string|null = null;

Promise.allSettled([
  // Read the initial values from the storages first
  TaggingProfile.readAll().then(profiles => {
    taggingProfiles.set(profiles);
  }),
  preferences.activeProfile.get().then(activeProfileId => {
    activeTaggingProfile.set(activeProfileId);
  })
]).then(() => {
  // And only after initial values are loaded, start watching for changes from storage and from user's interaction
  TaggingProfile.subscribe(profiles => {
    taggingProfiles.set(profiles);
  });

  preferences.subscribe(settings => {
    activeTaggingProfile.set(settings.activeProfile || null);
  });

  activeTaggingProfile.subscribe(profileId => {
    lastActiveProfileId = profileId;

    void preferences.activeProfile.set(profileId);
  });

  // Watch the existence of the active profile on every change.
  TaggingProfile.subscribe(profiles => {
    if (!profiles.find(profile => profile.id === lastActiveProfileId)) {
      activeTaggingProfile.set(null);
    }
  });
});
