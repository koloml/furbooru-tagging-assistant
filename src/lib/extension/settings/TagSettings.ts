import CacheableSettings from "$lib/extension/base/CacheableSettings";

interface TagSettingsFields {
  groupSeparation: boolean;
  replaceLinks: boolean;
}

export default class TagSettings extends CacheableSettings<TagSettingsFields> {
  constructor() {
    super("tag");
  }

  async resolveGroupSeparation() {
    return this._resolveSetting("groupSeparation", true);
  }

  async resolveReplaceLinks() {
    return this._resolveSetting("replaceLinks", false);
  }

  async setGroupSeparation(value: boolean) {
    return this._writeSetting("groupSeparation", Boolean(value));
  }

  async setReplaceLinks(value: boolean) {
    return this._writeSetting("replaceLinks", Boolean(value));
  }
}
