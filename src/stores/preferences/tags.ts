import { writable } from "svelte/store";
import TagsPreferences from "$lib/extension/preferences/TagsPreferences";

const preferences = new TagsPreferences();

export const shouldSeparateTagGroups = writable(false);
export const shouldReplaceLinksOnForumPosts = writable(false);
export const shouldReplaceTextOfTagLinks = writable(true);

Promise
  .allSettled([
    preferences.resolveGroupSeparation().then(value => shouldSeparateTagGroups.set(value)),
    preferences.resolveReplaceLinks().then(value => shouldReplaceLinksOnForumPosts.set(value)),
    preferences.resolveReplaceLinkText().then(value => shouldReplaceTextOfTagLinks.set(value)),
  ])
  .then(() => {
    shouldSeparateTagGroups.subscribe(value => {
      void preferences.setGroupSeparation(value);
    });

    shouldReplaceLinksOnForumPosts.subscribe(value => {
      void preferences.setReplaceLinks(value);
    });

    shouldReplaceTextOfTagLinks.subscribe(value => {
      void preferences.setReplaceLinkText(value);
    });

    preferences.subscribe(settings => {
      shouldSeparateTagGroups.set(Boolean(settings.groupSeparation));
      shouldReplaceLinksOnForumPosts.set(Boolean(settings.replaceLinks));
      shouldReplaceTextOfTagLinks.set(Boolean(settings.replaceLinkText));
    });
  });
