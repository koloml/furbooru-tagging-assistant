import type { FullscreenViewerSize } from "$lib/extension/settings/MiscSettings";

export const EVENT_SIZE_LOADED = 'size-loaded';

export interface FullscreenViewerEventsMap {
  [EVENT_SIZE_LOADED]: FullscreenViewerSize;
}
