import StorageEntity from "$lib/extension/base/StorageEntity";
import type { ImportableEntityObject } from "$lib/extension/transporting/importables";

type ExporterFunction<EntityType extends StorageEntity> = (entity: EntityType) => ImportableEntityObject<EntityType>;

type ExportersMap = {
  [EntityName in keyof App.EntityNamesMap]: ExporterFunction<App.EntityNamesMap[EntityName]>;
}

const entitiesExporters: ExportersMap = {
  profiles: entity => {
    return {
      $type: "profiles",
      v: 2,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      // Any exported profile should be considered non-temporary.
      temporary: false,
    }
  },
  groups: entity => {
    return {
      $type: "groups",
      v: 2,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      prefixes: entity.settings.prefixes,
      category: entity.settings.category,
    }
  }
};

export function exportEntityToObject<EntityName extends keyof App.EntityNamesMap>(
  entityName: EntityName,
  entityInstance: App.EntityNamesMap[EntityName]
): ImportableEntityObject<App.EntityNamesMap[EntityName]> {
  if (!(entityName in entitiesExporters) || !entitiesExporters.hasOwnProperty(entityName)) {
    throw new Error(`Missing exporter for entity: ${entityName}`);
  }

  return entitiesExporters[entityName].call(null, entityInstance);
}
