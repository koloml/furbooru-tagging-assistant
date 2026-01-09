import type TagGroup from "$entities/TagGroup";

export const EVENT_TAG_GROUP_RESOLVED = 'tag-group-resolved';

export interface TagDropdownEvents {
  [EVENT_TAG_GROUP_RESOLVED]: TagGroup | null;
}
