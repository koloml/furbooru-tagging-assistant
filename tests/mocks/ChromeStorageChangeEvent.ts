import ChromeEvent from "$tests/mocks/ChromeEvent";
import { EventEmitter } from "node:events";

type MockedStorageChanges = Record<string, chrome.storage.StorageChange>;
type IncomingStorageChangeListener = (changes: MockedStorageChanges) => void;

const storageChangeEvent = Symbol();

interface StorageChangeEventMap {
  [storageChangeEvent]: [MockedStorageChanges];
}

export default class ChromeStorageChangeEvent extends ChromeEvent<IncomingStorageChangeListener> {
  #emitter = new EventEmitter<StorageChangeEventMap>();

  addListener = vi.fn((actualListener: IncomingStorageChangeListener) => {
    this.#emitter.addListener(storageChangeEvent, actualListener);
  });

  removeListener = vi.fn((actualListener: IncomingStorageChangeListener) => {
    this.#emitter.removeListener(storageChangeEvent, actualListener);
  });

  mockEmitStorageChange(changes: MockedStorageChanges) {
    this.#emitter.emit(storageChangeEvent, changes);
  }
}
