import StorageEntity from "$lib/extension/base/StorageEntity";

export interface TaggingProfileSettings {
  name: string;
  tags: string[];
  temporary: boolean;
}

/**
 * Class representing the tagging profile entity.
 */
export default class TaggingProfile extends StorageEntity<TaggingProfileSettings> {
  /**
   * @param id ID of the entity.
   * @param settings Maintenance profile settings object.
   */
  constructor(id: string, settings: Partial<TaggingProfileSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
      temporary: settings.temporary ?? false
    });
  }

  async save(): Promise<void> {
    if (this.settings.temporary && !this.settings.tags?.length) {
      return this.delete();
    }

    return super.save();
  }

  public static readonly _entityName: keyof App.EntityNamesMap = "profiles";
}
