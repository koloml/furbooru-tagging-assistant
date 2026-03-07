import TaggingProfile from "$entities/TaggingProfile";
import CacheablePreferences, { PreferenceField, type WithFields } from "$lib/extension/base/CacheablePreferences";

interface TaggingProfilePreferencesFields {
  activeProfile: string | null;
  stripBlacklistedTags: boolean;
}

class ActiveProfilePreference extends PreferenceField<TaggingProfilePreferencesFields, "activeProfile"> {
  constructor(preferencesInstance: CacheablePreferences<TaggingProfilePreferencesFields>) {
    super(preferencesInstance, {
      field: "activeProfile",
      defaultValue: null,
    });
  }

  async asObject(): Promise<TaggingProfile | null> {
    const activeProfileId = await this.get();

    if (!activeProfileId) {
      return null;
    }

    return (await TaggingProfile.readAll())
      .find(profile => profile.id === activeProfileId) || null;
  }
}

export default class TaggingProfilesPreferences extends CacheablePreferences<TaggingProfilePreferencesFields> implements WithFields<TaggingProfilePreferencesFields> {
  constructor() {
    super("maintenance");
  }

  readonly activeProfile = new ActiveProfilePreference(this);

  readonly stripBlacklistedTags = new PreferenceField(this, {
    field: "stripBlacklistedTags",
    defaultValue: false,
  });
}
