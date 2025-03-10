import type TagGroup from "$entities/TagGroup";

export const eventTagCustomGroupResolved = 'tag-group-resolved';

export interface TagDropdownEvents {
    [eventTagCustomGroupResolved]: TagGroup | null;
}
