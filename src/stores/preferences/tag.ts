import { writable } from "svelte/store";
import TagSettings from "$lib/extension/settings/TagSettings";

const tagSettings = new TagSettings();

export const shouldSeparateTagGroups = writable(false);

tagSettings.resolveGroupSeparation()
  .then(value => shouldSeparateTagGroups.set(value))
  .then(() => {
    shouldSeparateTagGroups.subscribe(value => {
      void tagSettings.setGroupSeparation(value);
    });

    tagSettings.subscribe(settings => {
      shouldSeparateTagGroups.set(Boolean(settings.groupSeparation));
    });
  })
