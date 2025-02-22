import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { MaintenancePopup } from "$lib/components/MaintenancePopup";
import { on } from "$lib/components/events/comms";
import { eventActiveProfileChanged } from "$lib/components/events/maintenance-popup-events";
import type { MediaBoxWrapper } from "$lib/components/MediaBoxWrapper";
import type MaintenanceProfile from "$entities/MaintenanceProfile";

export class MediaBoxTools extends BaseComponent {
  #mediaBox: MediaBoxWrapper | null = null;
  #maintenancePopup: MaintenancePopup | null = null;

  init() {
    const mediaBoxElement = this.container.closest<HTMLElement>('.media-box');

    if (!mediaBoxElement) {
      throw new Error('Toolbox element initialized outside of the media box!');
    }

    this.#mediaBox = getComponent(mediaBoxElement);

    for (let childElement of this.container.children) {
      if (!(childElement instanceof HTMLElement)) {
        continue;
      }

      const component = getComponent(childElement);

      if (!component) {
        continue;
      }

      if (!component.isInitialized) {
        component.initialize();
      }

      if (!this.#maintenancePopup && component instanceof MaintenancePopup) {
        this.#maintenancePopup = component;
      }
    }

    on(this, eventActiveProfileChanged, this.#onActiveProfileChanged.bind(this));
  }

  #onActiveProfileChanged(profileChangedEvent: CustomEvent<MaintenanceProfile | null>) {
    this.container.classList.toggle('has-active-profile', profileChangedEvent.detail !== null);
  }

  get maintenancePopup(): MaintenancePopup | null {
    return this.#maintenancePopup;
  }

  get mediaBox(): MediaBoxWrapper | null {
    return this.#mediaBox;
  }
}

/**
 * Create a maintenance popup element.
 * @param childrenElements List of children elements to append to the component.
 * @return The maintenance popup element.
 */
export function createMediaBoxTools(...childrenElements: HTMLElement[]): HTMLElement {
  const mediaBoxToolsContainer = document.createElement('div');
  mediaBoxToolsContainer.classList.add('media-box-tools');

  if (childrenElements.length) {
    mediaBoxToolsContainer.append(...childrenElements);
  }

  new MediaBoxTools(mediaBoxToolsContainer);

  return mediaBoxToolsContainer;
}
