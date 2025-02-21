import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";
import MiscSettings from "$lib/extension/settings/MiscSettings";
import { FullscreenViewer } from "$lib/components/FullscreenViewer";
import type { MediaBoxTools } from "$lib/components/MediaBoxTools";

export class ImageShowFullscreenButton extends BaseComponent {
  #mediaBoxTools: MediaBoxTools | null = null;
  #isFullscreenButtonEnabled: boolean = false;

  protected build() {
    this.container.innerText = '🔍';

    ImageShowFullscreenButton.#miscSettings ??= new MiscSettings();
  }

  protected init() {
    if (!this.container.parentElement) {
      throw new Error('Missing parent element!');
    }

    this.#mediaBoxTools = getComponent(this.container.parentElement);

    if (!this.#mediaBoxTools) {
      throw new Error('Fullscreen button is placed outside of the tools container!');
    }

    this.on('click', this.#onButtonClicked.bind(this));

    if (ImageShowFullscreenButton.#miscSettings) {
      ImageShowFullscreenButton.#miscSettings.resolveFullscreenViewerEnabled()
        .then(isEnabled => {
          this.#isFullscreenButtonEnabled = isEnabled;
          this.#updateFullscreenButtonVisibility();
        })
        .then(() => {
          ImageShowFullscreenButton.#miscSettings?.subscribe(settings => {
            this.#isFullscreenButtonEnabled = settings.fullscreenViewer ?? true;
            this.#updateFullscreenButtonVisibility();
          })
        })
    }
  }

  #updateFullscreenButtonVisibility() {
    this.container.classList.toggle('is-visible', this.#isFullscreenButtonEnabled);
  }

  #onButtonClicked() {
    const imageLinks = this.#mediaBoxTools?.mediaBox.imageLinks;

    if (!imageLinks) {
      throw new Error('Failed to resolve image links from media box tools!');
    }

    ImageShowFullscreenButton
      .#resolveViewer()
      ?.show(imageLinks);
  }

  static #viewer: FullscreenViewer | null = null;

  static #resolveViewer(): FullscreenViewer {
    this.#viewer ??= this.#buildViewer();
    return this.#viewer;
  }

  static #buildViewer(): FullscreenViewer {
    const element = document.createElement('div');
    const viewer = new FullscreenViewer(element);

    viewer.initialize();

    document.body.append(element);

    return viewer;
  }

  static #miscSettings: MiscSettings | null = null;
}

export function createImageShowFullscreenButton() {
  const element = document.createElement('div');
  element.classList.add('media-box-show-fullscreen');

  new ImageShowFullscreenButton(element);

  return element;
}
