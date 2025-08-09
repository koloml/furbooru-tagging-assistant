import type StorageEntity from "$lib/extension/base/StorageEntity";

export interface ImportableElement<Type extends string = string> {
  /**
   * Type of importable. Should be unique to properly import everything.
   */
  $type: Type;
  /**
   * Identifier of the site this element is built for.
   */
  $site?: string;
}

export interface ImportableElementsList<ElementsType extends ImportableElement = ImportableElement> extends ImportableElement<"list"> {
  /**
   * List of elements inside. Elements could be of any type and should be checked and mapped.
   */
  elements: ElementsType[];
}

/**
 * Base information on the object which should be present on every entity.
 */
export interface BaseImportableEntity extends ImportableElement<keyof App.EntityNamesMap> {
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
export type ImportableEntityObject<EntityType extends StorageEntity> = { [ObjectKey in keyof BaseImportableEntity]: any }
  & { [SettingKey in keyof EntityType["settings"]]: any };
