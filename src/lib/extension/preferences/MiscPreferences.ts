import CacheablePreferences, {
  PreferenceField,
  type WithFields
} from "$lib/extension/base/CacheablePreferences";

export type FullscreenViewerSize = keyof App.ImageURIs;

interface MiscPreferencesFields {
  fullscreenViewer: boolean;
  fullscreenViewerSize: FullscreenViewerSize;
}

export default class MiscPreferences extends CacheablePreferences<MiscPreferencesFields> implements WithFields<MiscPreferencesFields> {
  constructor() {
    super("misc");
  }

  readonly fullscreenViewer = new PreferenceField(this, {
    field: "fullscreenViewer",
    defaultValue: true,
  });

  readonly fullscreenViewerSize = new PreferenceField(this, {
    field: "fullscreenViewerSize",
    defaultValue: "large",
  });
}
