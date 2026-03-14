import StorageEntity from "$lib/extension/base/StorageEntity";

interface TagEditorPresetSettings {
  name: string;
  tags: string[];
}

export default class TagEditorPreset extends StorageEntity<TagEditorPresetSettings> {
  constructor(id: string, settings: Partial<TagEditorPresetSettings>) {
    super(id, {
      name: settings.name || '',
      tags: settings.tags || [],
    });
  }

  public static readonly _entityName = 'presets';
}
