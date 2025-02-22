export const eventFetchComplete = 'fetchcomplete';

export interface BooruEventsMap {
  [eventFetchComplete]: null; // Site sends the response, but extension will not get it due to isolation.
}
