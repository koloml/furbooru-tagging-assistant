const featuresRoute = '/features';

interface PermalinksMap {
  list(): string;

  import(): string;

  detail(id: string): string;

  edit(id: string): string;

  delete(id: string): string;

  export(id: string): string;
}

type EntityPermalinksOverrides = Partial<PermalinksMap>;

export class EntityPermalinks implements PermalinksMap {
  readonly #entityName: string;
  readonly #overrides: EntityPermalinksOverrides = {};

  constructor(entityName: string, overrides: EntityPermalinksOverrides | null = null) {
    this.#entityName = entityName;

    if (overrides) {
      this.#overrides = overrides;
    }
  }

  list(): string {
    return this.#overrides.list?.() ?? `${featuresRoute}/${this.#entityName}`;
  }

  import(): string {
    return this.#overrides.import?.() ?? `${this.list()}/import`;
  }

  detail(id: string): string {
    return this.#overrides.detail?.(id) ?? `${this.list()}/${id}`;
  }

  edit(id: string): string {
    return this.#overrides.edit?.(id) ?? `${this.detail(id)}/edit`;
  }

  delete(id: string): string {
    return this.#overrides.detail?.(id) ?? `${this.detail(id)}/delete`;
  }

  export(id: string): string {
    return this.#overrides.export?.(id) ?? `${this.detail(id)}/export`;
  }
}

export const permalinks: Record<keyof App.EntityNamesMap, PermalinksMap> = {
  profiles: new EntityPermalinks('maintenance'),
  groups: new EntityPermalinks('groups'),
}
