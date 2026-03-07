import { writable } from "svelte/store";
import TagsPreferences from "$lib/extension/preferences/TagsPreferences";

const preferences = new TagsPreferences();

export const shouldSeparateTagGroups = writable(false);
export const shouldReplaceLinksOnForumPosts = writable(false);
export const shouldReplaceTextOfTagLinks = writable(true);

Promise
  .allSettled([
    preferences.groupSeparation.get().then(value => shouldSeparateTagGroups.set(value)),
    preferences.replaceLinks.get().then(value => shouldReplaceLinksOnForumPosts.set(value)),
    preferences.replaceLinkText.get().then(value => shouldReplaceTextOfTagLinks.set(value)),
  ])
  .then(() => {
    shouldSeparateTagGroups.subscribe(value => {
      void preferences.groupSeparation.set(value);
    });

    shouldReplaceLinksOnForumPosts.subscribe(value => {
      void preferences.replaceLinks.set(value);
    });

    shouldReplaceTextOfTagLinks.subscribe(value => {
      void preferences.replaceLinkText.set(value);
    });

    preferences.subscribe(settings => {
      shouldSeparateTagGroups.set(Boolean(settings.groupSeparation));
      shouldReplaceLinksOnForumPosts.set(Boolean(settings.replaceLinks));
      shouldReplaceTextOfTagLinks.set(Boolean(settings.replaceLinkText));
    });
  });
