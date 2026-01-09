import { BaseComponent } from "$content/components/base/BaseComponent";
import { getComponent } from "$content/components/base/component-utils";
import { MaintenancePopup } from "$content/components/MaintenancePopup";
import { on } from "$content/components/events/comms";
import { EVENT_ACTIVE_PROFILE_CHANGED } from "$content/components/events/maintenance-popup-events";
import type { MediaBoxWrapper } from "$content/components/MediaBoxWrapper";
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

    on(this, EVENT_ACTIVE_PROFILE_CHANGED, this.#onActiveProfileChanged.bind(this));
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
