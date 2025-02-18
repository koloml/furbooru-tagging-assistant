import StorageEntity from "$lib/extension/base/StorageEntity";
import type { ImportableObject } from "$lib/extension/transporting/importables";

type ExporterFunction<EntityType extends StorageEntity> = (entity: EntityType) => ImportableObject<EntityType>;

type ExportersMap = {
  [EntityName in keyof App.EntityNamesMap]: ExporterFunction<App.EntityNamesMap[EntityName]>;
}

const entitiesExporters: ExportersMap = {
  profiles: entity => {
    return {
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
    }
  },
  groups: entity => {
    return {
      v: 1,
      id: entity.id,
      name: entity.settings.name,
      tags: entity.settings.tags,
      prefixes: entity.settings.prefixes,
    }
  }
};

export function exportEntityToObject<EntityName extends keyof App.EntityNamesMap>(
  entityName: EntityName,
  entityInstance: App.EntityNamesMap[EntityName]
): ImportableObject<App.EntityNamesMap[EntityName]> {
  if (!(entityName in entitiesExporters) || !entitiesExporters.hasOwnProperty(entityName)) {
    throw new Error(`Missing exporter for entity: ${entityName}`);
  }

  return entitiesExporters[entityName].call(null, entityInstance);
}
