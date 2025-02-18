import { validateImportedEntity } from "$lib/extension/transporting/validators";
import { exportEntityToObject } from "$lib/extension/transporting/exporters";
import StorageEntity from "$lib/extension/base/StorageEntity";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export default class EntitiesTransporter<EntityType> {
  readonly #targetEntityConstructor: new (...any: any[]) => EntityType;

  /**
   * Name of the entity, exported directly from the constructor.
   * @private
   */
  get #entityName() {
    // How the hell should I even do this?
    const entityName = ((this.#targetEntityConstructor as any) as typeof StorageEntity)._entityName;

    if (entityName === "entity") {
      throw new Error("Generic entity name encountered!");
    }

    return entityName;
  }

  /**
   * @param entityConstructor Class which should be used for import or export.
   */
  constructor(entityConstructor: new (...any: any[]) => EntityType) {
    if (!(entityConstructor.prototype instanceof StorageEntity)) {
      throw new TypeError('Invalid class provided as the target for importing!');
    }

    this.#targetEntityConstructor = entityConstructor;
  }

  importFromJSON(jsonString: string): EntityType {
    const importedObject = this.#tryParsingAsJSON(jsonString);

    if (!importedObject) {
      throw new Error('Invalid JSON!');
    }

    validateImportedEntity(
      this.#entityName,
      importedObject,
    );

    return new this.#targetEntityConstructor(
      importedObject.id,
      importedObject
    );
  }

  importFromCompressedJSON(compressedJsonString: string): EntityType {
    return this.importFromJSON(
      decompressFromEncodedURIComponent(compressedJsonString)
    )
  }

  exportToJSON(entityObject: EntityType): string {
    if (!(entityObject instanceof this.#targetEntityConstructor)) {
      throw new TypeError('Transporter should be connected to the same entity to export!');
    }

    if (!(entityObject instanceof StorageEntity)) {
      throw new TypeError('Only storage entities could be exported!');
    }

    const exportableObject = exportEntityToObject(
      this.#entityName,
      entityObject
    );

    return JSON.stringify(exportableObject, null, 2);
  }

  exportToCompressedJSON(entityObject: EntityType): string {
    return compressToEncodedURIComponent(this.exportToJSON(entityObject));
  }

  #tryParsingAsJSON(jsonString: string): Record<string, any> | null {
    let jsonObject: Record<string, any> | null = null;

    try {
      jsonObject = JSON.parse(jsonString);
    } catch (e) {

    }

    if (typeof jsonObject !== "object") {
      throw new TypeError("Should be an object!");
    }

    return jsonObject
  }
}
