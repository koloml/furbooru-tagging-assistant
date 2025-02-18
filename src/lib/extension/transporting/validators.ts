import type StorageEntity from "$lib/extension/base/StorageEntity";
import type { ImportableObject } from "$lib/extension/transporting/importables";

/**
 * Function for validating the entities.
 * @todo Probably would be better to replace the throw-catch method with some kind of result-error returning type.
 *   Errors are only properly definable in the JSDoc.
 */
type ValidationFunction<EntityType extends StorageEntity> = (importedObject: ImportableObject<EntityType>) => void;

/**
 * Mapping of validation functions for all entities present in the extension. Key is a name of entity and value is a
 * function which throws an error when validation is failed.
 */
type EntitiesValidationMap = {
  [EntityKey in keyof App.EntityNamesMap]?: ValidationFunction<App.EntityNamesMap[EntityKey]>;
};

/**
 * Map of validators for each entity. Function should throw the error if validation failed.
 */
const entitiesValidators: EntitiesValidationMap = {
  profiles: importedObject => {
    if (importedObject.v !== 1) {
      throw new Error('Unsupported version!');
    }

    if (
      !importedObject.id
      || typeof importedObject.id !== "string"
      || !importedObject.name
      || typeof importedObject.name !== "string"
      || !importedObject.tags
      || !Array.isArray(importedObject.tags)
    ) {
      throw new Error('Invalid profile format detected!');
    }
  }
};

/**
 * Validate the structure of the entity.
 * @param importedObject Object imported from JSON.
 * @param entityName Name of the entity to validate. Should be loaded from the entity class.
 * @throws {Error} Error in case validation failed with the reason stored in the message.
 */
export function validateImportedEntity(importedObject: any, entityName: string) {
  if (!entitiesValidators.hasOwnProperty(entityName)) {
    console.error(`Trying to validate entity without the validator present! Entity name: ${entityName}`);
    return;
  }

  entitiesValidators[entityName as keyof EntitiesValidationMap]!.call(null, importedObject);
}
