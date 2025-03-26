import type MaintenanceProfile from "$entities/MaintenanceProfile";

export const EVENT_ACTIVE_PROFILE_CHANGED = 'active-profile-changed';
export const EVENT_MAINTENANCE_STATE_CHANGED = 'maintenance-state-change';
export const EVENT_TAGS_UPDATED = 'tags-updated';

type MaintenanceState = 'processing' | 'failed' | 'complete' | 'waiting';

export interface MaintenancePopupEventsMap {
  [EVENT_ACTIVE_PROFILE_CHANGED]: MaintenanceProfile | null;
  [EVENT_MAINTENANCE_STATE_CHANGED]: MaintenanceState;
  [EVENT_TAGS_UPDATED]: Map<string, string> | null;
}
