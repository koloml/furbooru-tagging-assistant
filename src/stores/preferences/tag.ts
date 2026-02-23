import { writable } from "svelte/store";
import TagSettings from "$lib/extension/settings/TagSettings";

const tagSettings = new TagSettings();

export const shouldSeparateTagGroups = writable(false);
export const shouldReplaceLinksOnForumPosts = writable(false);

Promise
  .allSettled([
    tagSettings.resolveGroupSeparation().then(value => shouldSeparateTagGroups.set(value)),
    tagSettings.resolveReplaceLinks().then(value => shouldReplaceLinksOnForumPosts.set(value)),
  ])
  .then(() => {
    shouldSeparateTagGroups.subscribe(value => {
      void tagSettings.setGroupSeparation(value);
    });

    shouldReplaceLinksOnForumPosts.subscribe(value => {
      void tagSettings.setReplaceLinks(value);
    });

    tagSettings.subscribe(settings => {
      shouldSeparateTagGroups.set(Boolean(settings.groupSeparation));
      shouldReplaceLinksOnForumPosts.set(Boolean(settings.replaceLinks));
    });
  });
