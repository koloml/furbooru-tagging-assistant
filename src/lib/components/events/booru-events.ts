export const EVENT_FETCH_COMPLETE = 'fetchcomplete';

export interface BooruEventsMap {
  [EVENT_FETCH_COMPLETE]: null; // Site sends the response, but extension will not get it due to isolation.
}
