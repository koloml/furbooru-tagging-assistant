import CacheablePreferences, { PreferenceField, type WithFields } from "$lib/extension/base/CacheablePreferences";

interface TagsPreferencesFields {
  groupSeparation: boolean;
  replaceLinks: boolean;
  replaceLinkText: boolean;
}

export default class TagsPreferences extends CacheablePreferences<TagsPreferencesFields> implements WithFields<TagsPreferencesFields> {
  constructor() {
    super("tag");
  }

  readonly groupSeparation = new PreferenceField(this, {
    field: "groupSeparation",
    defaultValue: true,
  });

  readonly replaceLinks = new PreferenceField(this, {
    field: "replaceLinks",
    defaultValue: false,
  });

  readonly replaceLinkText = new PreferenceField(this, {
    field: "replaceLinkText",
    defaultValue: true,
  });
}
