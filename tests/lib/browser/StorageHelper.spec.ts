import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";
import StorageHelper from "$lib/browser/StorageHelper";
import { expect } from "vitest";

describe('StorageHelper', () => {
  let storageAreaMock: ChromeStorageArea;
  let storageHelper: StorageHelper;

  beforeEach(() => {
    storageAreaMock = new ChromeStorageArea();
    storageHelper = new StorageHelper(storageAreaMock);
  });

  it("should return value when data exists", async () => {
    const key = 'existingKey';
    const value = 'test value';

    storageAreaMock.insertMockedData({[key]: value});

    expect(await storageHelper.read(key)).toBe(value);
  });

  it('should return default when data is not present', async () => {
    const fallbackValue = 'fallback';

    expect(await storageHelper.read('nonexistent', fallbackValue)).toBe(fallbackValue);
  });

  it('should treat falsy values as existing values', async () => {
    const falsyValues = [false, '', 0];
    const key = 'testedKey';
    const fallbackValue = 'fallback';

    for (let testedValue of falsyValues) {
      storageAreaMock.insertMockedData({[key]: testedValue});

      expect(await storageHelper.read(key, fallbackValue)).toBe(testedValue);
    }
  });
});
