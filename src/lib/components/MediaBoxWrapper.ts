import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { buildTagsAndAliasesMap } from "$lib/booru/tag-utils";
import { on } from "$lib/components/events/comms";
import { EVENT_TAGS_UPDATED } from "$lib/components/events/maintenance-popup-events";

export class MediaBoxWrapper extends BaseComponent {
  #thumbnailContainer: HTMLElement | null = null;
  #imageLinkElement: HTMLAnchorElement | null = null;
  #tagsAndAliases: Map<string, string> | null = null;

  init() {
    this.#thumbnailContainer = this.container.querySelector('.image-container');
    this.#imageLinkElement = this.#thumbnailContainer?.querySelector('a') || null;

    on(this, EVENT_TAGS_UPDATED, this.#onTagsUpdatedRefreshTagsAndAliases.bind(this));
  }

  #onTagsUpdatedRefreshTagsAndAliases(tagsUpdatedEvent: CustomEvent<Map<string, string> | null>) {
    const updatedMap = tagsUpdatedEvent.detail;

    if (!(updatedMap instanceof Map)) {
      throw new TypeError("Tags and aliases should be stored as Map!");
    }

    this.#tagsAndAliases = updatedMap;
  }

  #calculateMediaBoxTags() {
    const tagAliases: string[] = this.#thumbnailContainer?.dataset.imageTagAliases?.split(', ') || [];
    const actualTags = this.#imageLinkElement?.title.split(' | Tagged: ')[1]?.split(', ') || [];

    return buildTagsAndAliasesMap(tagAliases, actualTags);
  }

  get tagsAndAliases(): Map<string, string> | null {
    if (!this.#tagsAndAliases) {
      this.#tagsAndAliases = this.#calculateMediaBoxTags();
    }

    return this.#tagsAndAliases;
  }

  get imageId(): number {
    const imageId = this.container.dataset.imageId;

    if (!imageId) {
      throw new Error('Missing image ID');
    }

    return parseInt(imageId);
  }

  get imageLinks(): App.ImageURIs {
    const jsonUris = this.#thumbnailContainer?.dataset.uris;

    if (!jsonUris) {
      throw new Error('Missing URIs!');
    }

    return JSON.parse(jsonUris);
  }
}

/**
 * Wrap the media box element into the special wrapper.
 */
export function initializeMediaBox(mediaBoxContainer: HTMLElement, childComponentElements: HTMLElement[]) {
  new MediaBoxWrapper(mediaBoxContainer)
    .initialize();

  for (let childComponentElement of childComponentElements) {
    mediaBoxContainer.appendChild(childComponentElement);
    getComponent(childComponentElement)?.initialize();
  }
}

export function calculateMediaBoxesPositions(mediaBoxesList: NodeListOf<HTMLElement>) {
  window.addEventListener('resize', () => {
    let lastMediaBox: HTMLElement | null = null;
    let lastMediaBoxPosition: number | null = null;

    for (const mediaBoxElement of mediaBoxesList) {
      const yPosition = mediaBoxElement.getBoundingClientRect().y;
      const isOnTheSameLine = yPosition === lastMediaBoxPosition;

      mediaBoxElement.classList.toggle('media-box--first', !isOnTheSameLine);
      lastMediaBox?.classList.toggle('media-box--last', !isOnTheSameLine);

      lastMediaBox = mediaBoxElement;
      lastMediaBoxPosition = yPosition;
    }
  })
}
