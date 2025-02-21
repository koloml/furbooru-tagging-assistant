import type { FullscreenViewerSize } from "$lib/extension/settings/MiscSettings";

export const eventSizeLoaded = 'size-loaded';

export interface FullscreenViewerEventsMap {
  [eventSizeLoaded]: FullscreenViewerSize;
}
