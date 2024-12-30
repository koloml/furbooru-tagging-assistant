import {BaseComponent} from "$lib/components/base/BaseComponent.js";
import {getComponent} from "$lib/components/base/ComponentUtils.js";
import MiscSettings from "$lib/extension/settings/MiscSettings.ts";
import {FullscreenViewer} from "$lib/components/FullscreenViewer.js";

export class ImageShowFullscreenButton extends BaseComponent {
  /**
   * @type {MediaBoxTools}
   */
  #mediaBoxTools;
  #isFullscreenButtonEnabled = false;

  build() {
    this.container.innerText = '🔍';

    ImageShowFullscreenButton.#miscSettings ??= new MiscSettings();
  }

  init() {
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
          ImageShowFullscreenButton.#miscSettings.subscribe(settings => {
            this.#isFullscreenButtonEnabled = settings.fullscreenViewer;
            this.#updateFullscreenButtonVisibility();
          })
        })
    }
  }

  #updateFullscreenButtonVisibility() {
    this.container.classList.toggle('is-visible', this.#isFullscreenButtonEnabled);
  }

  #onButtonClicked() {
    ImageShowFullscreenButton
      .#resolveViewer()
      .show(this.#mediaBoxTools.mediaBox.imageLinks);
  }

  /**
   * @type {FullscreenViewer|null}
   */
  static #viewer = null;

  /**
   * @return {FullscreenViewer}
   */
  static #resolveViewer() {
    this.#viewer ??= this.#buildViewer();
    return this.#viewer;
  }

  /**
   * @return {FullscreenViewer}
   */
  static #buildViewer() {
    const element = document.createElement('div');
    const viewer = new FullscreenViewer(element);

    viewer.initialize();

    document.body.append(element);

    return viewer;
  }

  /**
   * @type {MiscSettings|null}
   */
  static #miscSettings = null;
}

export function createImageShowFullscreenButton() {
  const element = document.createElement('div');
  element.classList.add('media-box-show-fullscreen');

  new ImageShowFullscreenButton(element);

  return element;
}
