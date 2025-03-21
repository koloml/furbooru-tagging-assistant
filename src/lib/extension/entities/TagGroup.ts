import StorageEntity from "$lib/extension/base/StorageEntity";

export interface TagGroupSettings {
  name: string;
  tags: string[];
  prefixes: string[];
  suffixes: string[];
  category: string;
  separate: boolean;
}

export default class TagGroup extends StorageEntity<TagGroupSettings> {
  constructor(id: string, settings: Partial<TagGroupSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
      prefixes: settings.prefixes || [],
      suffixes: settings.suffixes || [],
      category: settings.category || '',
      separate: Boolean(settings.separate),
    });
  }

  static _entityName = 'groups';
}
