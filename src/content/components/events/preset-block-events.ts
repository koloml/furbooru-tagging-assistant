export const EVENT_PRESET_TAG_CHANGE_APPLIED = 'preset-tag-changed';

export interface PresetTagChange {
  addedTags?: Set<string>;
  removedTags?: Set<string>;
}

export interface PresetBlockEventsMap {
  [EVENT_PRESET_TAG_CHANGE_APPLIED]: PresetTagChange;
}
