import type StorageEntity from "$lib/extension/base/StorageEntity";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { ImportableElementsList, ImportableEntityObject } from "$lib/extension/transporting/importables";
import EntitiesTransporter from "$lib/extension/EntitiesTransporter";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import TagGroup from "$entities/TagGroup";

type TransportersMapping = {
  [EntityName in keyof App.EntityNamesMap]: EntitiesTransporter<App.EntityNamesMap[EntityName]>;
}

export default class BulkEntitiesTransporter {
  parseAndImportFromJSON(jsonString: string): StorageEntity[] {
    let parsedObject: any;

    try {
      parsedObject = JSON.parse(jsonString);
    } catch (e) {
      throw new TypeError('Invalid JSON!', {cause: e});
    }

    if (!BulkEntitiesTransporter.isList(parsedObject)) {
      throw new TypeError('Invalid or unsupported object!');
    }

    return parsedObject.elements
      .map(importableObject => {
        if (!(importableObject.$type in BulkEntitiesTransporter.#transporters)) {
          console.warn('Attempting to import unsupported entity: ' + importableObject.$type);
          return null;
        }

        const transporter = BulkEntitiesTransporter.#transporters[importableObject.$type as keyof App.EntityNamesMap];
        return transporter.importFromObject(importableObject);
      })
      .filter(maybeEntity => !!maybeEntity);
  }

  parseAndImportFromCompressedJSON(compressedJsonString: string): StorageEntity[] {
    return this.parseAndImportFromJSON(
      decompressFromEncodedURIComponent(compressedJsonString)
    );
  }

  exportToJSON(entities: StorageEntity[]): string {
    return JSON.stringify({
      $type: 'list',
      elements: entities
        .map(entity => {
          switch (true) {
            case entity instanceof MaintenanceProfile:
              return BulkEntitiesTransporter.#transporters.profiles.exportToObject(entity);
            case entity instanceof TagGroup:
              return BulkEntitiesTransporter.#transporters.groups.exportToObject(entity);
          }

          return null;
        })
        .filter(value => !!value)
    } as ImportableElementsList<ImportableEntityObject<StorageEntity>>, null, 2);
  }

  exportToCompressedJSON(entities: StorageEntity[]): string {
    return compressToEncodedURIComponent(
      this.exportToJSON(entities)
    );
  }

  static isList(targetObject: any): targetObject is ImportableElementsList<ImportableEntityObject<StorageEntity>> {
    return targetObject.$type
      && targetObject.$type === 'list'
      && targetObject.elements
      && Array.isArray(targetObject.elements);
  }

  static #transporters: TransportersMapping = {
    profiles: new EntitiesTransporter(MaintenanceProfile),
    groups: new EntitiesTransporter(TagGroup),
  }
}
