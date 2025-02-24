import ConfigurationController from "$lib/extension/ConfigurationController";
import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";
import StorageHelper from "$lib/browser/StorageHelper";
import { randomString } from "$tests/utils";

describe('ConfigurationController', () => {
  const mockedStorageArea = new ChromeStorageArea();
  const mockedStorageHelper = new StorageHelper(mockedStorageArea);

  beforeEach(() => {
    mockedStorageArea.clear();
  });

  it('should read setting from the field inside the configuration object', async () => {
    const name = randomString();
    const field = randomString();
    const value = randomString();

    mockedStorageArea.insertMockedData({
      [name]: {
        [field]: value
      }
    });

    const controller = new ConfigurationController(name, mockedStorageHelper);
    const returnedValue = await controller.readSetting(field);

    expect(returnedValue).toBe(value);
  });

  it('should return fallback value if configuration field does not exist', async () => {
    const controller = new ConfigurationController(randomString(), mockedStorageHelper);
    const fallbackValue = randomString();
    const returnedValue = await controller.readSetting(randomString(), fallbackValue);

    expect(returnedValue).toBe(fallbackValue);
  });

  it('should treat existing falsy values as existing values', async () => {
    const name = randomString();

    const falsyValuesStorage = [0, false, ''].reduce((record, value) => {
      record[randomString()] = value;
      return record;
    }, {} as Record<string, any>);

    mockedStorageArea.insertMockedData({
      [name]: falsyValuesStorage
    });

    const controller = new ConfigurationController(name, mockedStorageHelper);

    for (const fieldName of Object.keys(falsyValuesStorage)) {
      const returnedValue = await controller.readSetting(fieldName, randomString());

      expect(returnedValue).toBe(falsyValuesStorage[fieldName]);
    }
  });

  it('should write data to storage', async () => {
    const name = randomString();
    const field = randomString();
    const value = randomString();

    const controller = new ConfigurationController(name, mockedStorageHelper);
    await controller.writeSetting(field, value);

    const expectedStructure = {
      [name]: {
        [field]: value,
      }
    };

    expect(mockedStorageArea.mockedData).toEqual(expectedStructure);
  });

  it('should update existing object without touching other entries', async () => {
    const name = randomString();
    const existingField = randomString();
    const existingValue = randomString();
    const addedField = randomString();
    const addedValue = randomString();

    mockedStorageArea.insertMockedData({
      [name]: {
        [existingField]: existingValue,
      }
    });

    const controller = new ConfigurationController(name, mockedStorageHelper);
    await controller.writeSetting(addedField, addedValue);

    const expectedStructure = {
      [name]: {
        [existingField]: existingValue,
        [addedField]: addedValue,
      }
    }

    expect(mockedStorageArea.mockedData).toEqual(expectedStructure);
  });

  it('should delete setting from storage', async () => {
    const name = randomString();
    const field = randomString();
    const value = randomString();

    mockedStorageArea.insertMockedData({
      [name]: {
        [field]: value
      }
    });

    const controller = new ConfigurationController(name, mockedStorageHelper);
    await controller.deleteSetting(field);

    expect(mockedStorageArea.mockedData).toEqual({
      [name]: {},
    });
  });

  it('should return updated settings contents on changes', async () => {
    const name = randomString();
    const initialField = randomString();
    const initialValue = randomString();

    const addedField = randomString();
    const addedValue = randomString();

    const updatedInitialValue = randomString();
    const receivedData: Record<string, string>[] = [];

    mockedStorageArea.insertMockedData({
      [name]: {
        [initialField]: initialValue,
      }
    });

    const controller = new ConfigurationController(name, mockedStorageHelper);
    const subscriber = vi.fn((storageState: Record<string, string>) => {
      receivedData.push(JSON.parse(JSON.stringify(storageState)));
    });

    controller.subscribeToChanges(subscriber);

    await controller.writeSetting(addedField, addedValue);
    await controller.writeSetting(initialField, updatedInitialValue);
    await controller.deleteSetting(initialField);

    expect(subscriber).toBeCalledTimes(3);

    const expectedData: Record<string, string>[] = [
      // First, initial data and added field are present
      {
        [initialField]: initialValue,
        [addedField]: addedValue,
      },
      // Then we get new value on initial field
      {
        [initialField]: updatedInitialValue,
        [addedField]: addedValue,
      },
      // And then the initial value is dropped
      {
        [addedField]: addedValue,
      }
    ];

    expect(receivedData).toEqual(expectedData);
  });

  it('should stop listening once unsubscribe called', async () => {
    const controller = new ConfigurationController(randomString(), mockedStorageHelper);
    const subscriber = vi.fn();

    const unsubscribe = controller.subscribeToChanges(subscriber);

    await controller.writeSetting(randomString(), randomString());
    expect(subscriber).toBeCalledTimes(1);

    unsubscribe();
    subscriber.mockReset();
    await controller.writeSetting(randomString(), randomString())
    expect(subscriber).not.toBeCalled();
  });
});
