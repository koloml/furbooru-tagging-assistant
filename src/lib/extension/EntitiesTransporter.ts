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

  isCorrectEntity(entityObject: unknown): entityObject is EntityType {
    return entityObject instanceof this.#targetEntityConstructor;
  }

  importFromObject(importedObject: Record<string, any>): EntityType {
    validateImportedEntity(
      this.#entityName,
      importedObject,
    );

    return new this.#targetEntityConstructor(
      importedObject.id,
      importedObject
    );
  }

  importFromJSON(jsonString: string): EntityType {
    const importedObject = this.#tryParsingAsJSON(jsonString);

    if (!importedObject) {
      throw new Error('Invalid JSON!');
    }

    return this.importFromObject(importedObject);
  }

  importFromCompressedJSON(compressedJsonString: string): EntityType {
    return this.importFromJSON(
      decompressFromEncodedURIComponent(compressedJsonString)
    )
  }

  exportToObject(entityObject: EntityType) {
    if (!this.isCorrectEntity(entityObject)) {
      throw new TypeError('Transporter should be connected to the same entity to export!');
    }

    if (!(entityObject instanceof StorageEntity)) {
      throw new TypeError('Only storage entities could be exported!');
    }

    return exportEntityToObject(
      this.#entityName,
      entityObject
    );
  }

  exportToJSON(entityObject: EntityType): string {
    return JSON.stringify(
      this.exportToObject(entityObject),
      null,
      2
    );
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
