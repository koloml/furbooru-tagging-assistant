import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import { on } from "$lib/components/events/comms";
import { EVENT_MAINTENANCE_STATE_CHANGED } from "$lib/components/events/maintenance-popup-events";
import type { MediaBoxTools } from "$lib/components/MediaBoxTools";

export class MaintenanceStatusIcon extends BaseComponent {
  #mediaBoxTools: MediaBoxTools | null = null;

  build() {
    this.container.innerText = '🔧';
  }

  init() {
    if (!this.container.parentElement) {
      throw new Error('Missing parent element for the maintenance status icon!');
    }

    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Status icon element initialized outside of the media box!');
    }

    on(this.#mediaBoxTools, EVENT_MAINTENANCE_STATE_CHANGED, this.#onMaintenanceStateChanged.bind(this));
  }

  #onMaintenanceStateChanged(stateChangeEvent: CustomEvent<string>) {
    // TODO Replace those with FontAwesome icons later. Those icons can probably be sourced from the website itself.
    switch (stateChangeEvent.detail) {
      case "ready":
        this.container.innerText = '🔧';
        break;

      case "waiting":
        this.container.innerText = '⏳';
        break;

      case "processing":
        this.container.innerText = '📤';
        break;

      case "complete":
        this.container.innerText = '✅';
        break;

      case "failed":
        this.container.innerText = '⚠️';
        break;

      default:
        this.container.innerText = '❓';
    }
  }
}

export function createMaintenanceStatusIcon() {
  const element = document.createElement('div');
  element.classList.add('maintenance-status-icon');

  new MaintenanceStatusIcon(element);

  return element;
}
