export const EVENT_FETCH_COMPLETE = 'fetchcomplete';
export const EVENT_RELOAD = 'reload';

/**
 * Custom data for the reload event on plain editor textarea. Philomena doesn't send anything on this event.
 */
export interface ReloadCustomOptions {
  skipTagColorRefresh?: boolean;
  skipTagRefresh?: boolean;
}

export interface BooruEventsMap {
  [EVENT_FETCH_COMPLETE]: null; // Site sends the response, but extension will not get it due to isolation.
  [EVENT_RELOAD]: ReloadCustomOptions|null;
}
