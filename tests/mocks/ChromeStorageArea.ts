import ChromeStorageChangeEvent from "$tests/mocks/ChromeStorageChangeEvent";

type ChangedEventCallback = (changes: chrome.storage.StorageChange) => void

export default class ChromeStorageArea implements chrome.storage.StorageArea {
  #mockedData: Record<string, any> = {};

  getBytesInUse = vi.fn();
  clear = vi.fn((): Promise<void> => {
    return new Promise(resolve => {
      this.#mockedData = {};
      resolve();
    })
  });
  set = vi.fn((...args: any[]): Promise<void> => {
    return new Promise((resolve) => {
      const change: Record<string, chrome.storage.StorageChange> = {};
      const setter = args[0];

      for (let targetKey of Object.keys(setter)) {
        change[targetKey] = {
          oldValue: this.#mockedData[targetKey] ?? undefined,
          newValue: setter[targetKey],
        };
      }

      this.#mockedData = Object.assign(this.#mockedData, args[0]);
      this.onChanged.mockEmitStorageChange(change);

      resolve();
    })
  });
  remove = vi.fn((...args: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const key = args[0];

      if (typeof key === 'string') {
        const change: chrome.storage.StorageChange = {
          oldValue: this.#mockedData[key],
        };

        delete this.#mockedData[key];

        this.onChanged.mockEmitStorageChange({
          [key]: change
        });

        resolve();
      }

      reject(new Error('This behavior is not mocked!'));
    });
  });
  get = vi.fn((...args: any[]) => {
    return new Promise((resolve, reject) => {
      const key = args[0];

      if (!key) {
        resolve(this.#mockedData);
        return;
      }

      if (typeof key === 'string') {
        resolve({[key]: this.#mockedData[key]});
        return;
      }

      if (Array.isArray(key)) {
        resolve(
          (key as string[]).reduce((entries, key) => {
            entries[key] = this.#mockedData[key];
            return entries;
          }, {} as Record<string, any>)
        );
        return;
      }

      reject(new Error('This behavior is not implemented by the mock.'));
    });
  });
  setAccessLevel = vi.fn();
  onChanged = new ChromeStorageChangeEvent();
  getKeys = vi.fn();

  insertMockedData(data: Record<string, any>) {
    this.#mockedData = data;
  }

  get mockedData(): Record<string, any> {
    return this.#mockedData;
  }
}
