import CacheablePreferences from "$lib/extension/base/CacheablePreferences";

export type FullscreenViewerSize = keyof App.ImageURIs;

interface MiscPreferencesFields {
  fullscreenViewer: boolean;
  fullscreenViewerSize: FullscreenViewerSize;
}

export default class MiscPreferences extends CacheablePreferences<MiscPreferencesFields> {
  constructor() {
    super("misc");
  }

  async resolveFullscreenViewerEnabled() {
    return this._resolveSetting("fullscreenViewer", true);
  }

  async resolveFullscreenViewerPreviewSize() {
    return this._resolveSetting('fullscreenViewerSize', 'large');
  }

  async setFullscreenViewerEnabled(isEnabled: boolean) {
    return this._writeSetting("fullscreenViewer", isEnabled);
  }

  async setFullscreenViewerPreviewSize(size: FullscreenViewerSize | string) {
    return this._writeSetting('fullscreenViewerSize', size as FullscreenViewerSize);
  }
}
