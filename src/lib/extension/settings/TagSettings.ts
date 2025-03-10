import CacheableSettings from "$lib/extension/base/CacheableSettings";

interface TagSettingsFields {
  groupSeparation: boolean;
}

export default class TagSettings extends CacheableSettings<TagSettingsFields> {
  constructor() {
    super("tag");
  }

  async resolveGroupSeparation() {
    return this._resolveSetting("groupSeparation", true);
  }

  async setGroupSeparation(value: boolean) {
    return this._writeSetting("groupSeparation", Boolean(value));
  }
}
