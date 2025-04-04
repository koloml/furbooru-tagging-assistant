export default class ChromeEvent<T extends Function> implements chrome.events.Event<T> {
  addListener = vi.fn();
  getRules = vi.fn();
  hasListener = vi.fn();
  removeRules = vi.fn();
  addRules = vi.fn();
  removeListener = vi.fn();
  hasListeners = vi.fn();
}
