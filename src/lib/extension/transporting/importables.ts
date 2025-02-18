import type StorageEntity from "$lib/extension/base/StorageEntity";

/**
 * Base information on the object which should be present on every entity.
 */
export interface BaseImportableObject {
  /**
   * Numeric version of the entity for upgrading.
   */
  v: number;
  /**
   * Unique ID of the entity.
   */
  id: string;
}

/**
 * Utility type which combines base importable object and the entity type interfaces together. It strips away any types
 * defined for the properties, since imported object can not be trusted and should be type-checked by the validators.
 */
export type ImportableObject<EntityType extends StorageEntity> = { [ObjectKey in keyof BaseImportableObject]: any }
  & { [SettingKey in keyof EntityType["settings"]]: any };
