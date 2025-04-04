import { BaseComponent } from "$lib/components/base/BaseComponent";
import MiscSettings, { type FullscreenViewerSize } from "$lib/extension/settings/MiscSettings";
import { emit, on } from "$lib/components/events/comms";
import { EVENT_SIZE_LOADED } from "$lib/components/events/fullscreen-viewer-events";

export class FullscreenViewer extends BaseComponent {
  #videoElement: HTMLVideoElement = document.createElement('video');
  #imageElement: HTMLImageElement = document.createElement('img');
  #spinnerElement: HTMLElement = document.createElement('i');
  #sizeSelectorElement: HTMLSelectElement = document.createElement('select');
  #closeButtonElement: HTMLElement = document.createElement('i');
  #touchId: number | null = null;
  #startX: number | null = null;
  #startY: number | null = null;
  #isClosingSwipeStarted: boolean | null = null;
  #isSizeFetched: boolean = false;
  #currentURIs: App.ImageURIs | null = null;

  protected build() {
    this.container.classList.add('fullscreen-viewer');

    this.container.append(
      this.#spinnerElement,
      this.#sizeSelectorElement,
      this.#closeButtonElement,
    );

    this.#spinnerElement.classList.add('spinner', 'fa', 'fa-circle-notch', 'fa-spin');
    this.#closeButtonElement.classList.add('close', 'fa', 'fa-xmark');
    this.#sizeSelectorElement.classList.add('size-selector', 'input');

    for (const [sizeKey, sizeName] of Object.entries(FullscreenViewer.#previewSizes)) {
      const sizeOptionElement = document.createElement('option');
      sizeOptionElement.value = sizeKey;
      sizeOptionElement.innerText = sizeName;

      this.#sizeSelectorElement.append(sizeOptionElement);
    }
  }

  /**
   * @protected
   */
  init() {
    document.addEventListener('keydown', this.#onDocumentKeyPressed.bind(this));
    this.on('click', this.#close.bind(this));

    this.on('touchstart', this.#onTouchStart.bind(this));
    this.on('touchmove', this.#onTouchMove.bind(this));
    this.on('touchend', this.#onTouchEnd.bind(this));

    this.#videoElement.addEventListener('loadeddata', this.#onLoaded.bind(this));
    this.#imageElement.addEventListener('load', this.#onLoaded.bind(this));
    this.#sizeSelectorElement.addEventListener('click', event => event.stopPropagation());

    FullscreenViewer.#miscSettings
      .resolveFullscreenViewerPreviewSize()
      .then(this.#onSizeResolved.bind(this))
      .then(this.#watchForSizeSelectionChanges.bind(this));
  }

  #onLoaded() {
    this.container.classList.remove('loading');
  }

  #onTouchStart(event: TouchEvent) {
    if (this.#touchId !== null) {
      return;
    }

    const firstTouch = event.touches.item(0);

    if (!firstTouch) {
      return;
    }

    this.#touchId = firstTouch.identifier;
    this.#startX = firstTouch.clientX;
    this.#startY = firstTouch.clientY;

    this.container.classList.add(FullscreenViewer.#swipeState);
  }

  #onTouchEnd(event: TouchEvent) {
    if (this.#touchId === null || this.#startY === null) {
      return;
    }

    const endedTouch = Array.from(event.changedTouches)
      .find(touch => touch.identifier === this.#touchId);

    if (!endedTouch) {
      return;
    }

    const verticalDistance = Math.abs(endedTouch.clientY - this.#startY);
    const requiredClosingDistance = window.innerHeight / 3;

    if (this.#isClosingSwipeStarted && verticalDistance > requiredClosingDistance) {
      this.#close();
    }

    this.#touchId = null;
    this.#startX = null;
    this.#startY = null;
    this.#isClosingSwipeStarted = null;

    this.container.classList.remove(FullscreenViewer.#swipeState);

    requestAnimationFrame(() => {
      this.container.style.removeProperty(FullscreenViewer.#offsetProperty);
      this.container.style.removeProperty(FullscreenViewer.#opacityProperty);
    });
  }

  #onTouchMove(event: TouchEvent) {
    if (this.#touchId === null || this.#startY === null || this.#startX === null) {
      return;
    }

    if (this.#isClosingSwipeStarted === false) {
      return;
    }

    for (const changedTouch of event.changedTouches) {
      if (changedTouch.identifier !== this.#touchId) {
        continue;
      }

      const verticalDistance = changedTouch.clientY - this.#startY;

      if (this.#isClosingSwipeStarted === null) {
        const horizontalDistance = changedTouch.clientX - this.#startX;

        if (Math.abs(verticalDistance) >= FullscreenViewer.#minRequiredDistance) {
          this.#isClosingSwipeStarted = true;
        } else if (Math.abs(horizontalDistance) >= FullscreenViewer.#minRequiredDistance) {
          this.#isClosingSwipeStarted = false;
          break;
        } else {
          break;
        }
      }

      this.container.style.setProperty(
        FullscreenViewer.#offsetProperty,
        verticalDistance.toString().concat('px')
      );

      const maxDistance = window.innerHeight * 2;
      let opacity = 1;

      if (verticalDistance !== 0) {
        opacity -= Math.min(1, Math.abs(verticalDistance) / maxDistance);
      }

      this.container.style.setProperty(
        FullscreenViewer.#opacityProperty,
        opacity.toString()
      );

      break;
    }
  }

  #onDocumentKeyPressed(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Esc') {
      this.#close();
    }
  }

  #onSizeResolved(size: FullscreenViewerSize) {
    this.#sizeSelectorElement.value = size;
    this.#isSizeFetched = true;

    emit(this.container, EVENT_SIZE_LOADED, size);
  }

  #watchForSizeSelectionChanges() {
    let lastActiveSize = this.#sizeSelectorElement.value;

    FullscreenViewer.#miscSettings.subscribe(settings => {
      const targetSize = settings.fullscreenViewerSize;

      if (!targetSize || lastActiveSize === targetSize) {
        return;
      }

      lastActiveSize = targetSize;
      this.#sizeSelectorElement.value = targetSize;
    });

    this.#sizeSelectorElement.addEventListener('input', () => {
      const targetSize = this.#sizeSelectorElement.value;

      if (this.#currentURIs) {
        void this.show(this.#currentURIs);
      }

      if (!targetSize || targetSize === lastActiveSize || !(targetSize in FullscreenViewer.#previewSizes)) {
        return;
      }

      lastActiveSize = targetSize;
      void FullscreenViewer.#miscSettings.setFullscreenViewerPreviewSize(targetSize);
    });
  }

  #close() {
    this.#currentURIs = null;

    this.container.classList.remove(FullscreenViewer.#shownState);
    document.body.style.removeProperty('overflow');

    requestAnimationFrame(() => {
      this.#videoElement.volume = 0;
      this.#videoElement.pause();
      this.#videoElement.remove();
    });
  }

  async #resolveCurrentSelectedSizeUrl(imageUris: App.ImageURIs): Promise<string | null> {
    if (!this.#isSizeFetched) {
      await new Promise(
        resolve => on(
          this.container,
          EVENT_SIZE_LOADED,
          resolve
        ),
      );
    }

    let targetSize: FullscreenViewerSize | string = this.#sizeSelectorElement.value;

    if (!imageUris.hasOwnProperty(targetSize)) {
      targetSize = FullscreenViewer.#fallbackSize;
    }

    if (!imageUris.hasOwnProperty(targetSize)) {
      targetSize = Object.keys(imageUris)[0];
    }

    if (!targetSize) {
      return null;
    }

    return imageUris[targetSize as FullscreenViewerSize];
  }

  async show(imageUris: App.ImageURIs): Promise<void> {
    this.#currentURIs = imageUris;

    const url = await this.#resolveCurrentSelectedSizeUrl(imageUris);

    if (!url) {
      console.warn('Failed to resolve media for the viewer!');
      return;
    }

    this.container.classList.add('loading');

    requestAnimationFrame(() => {
      this.container.classList.add(FullscreenViewer.#shownState);
      document.body.style.overflow = 'hidden';
    });

    if (FullscreenViewer.#isVideoUrl(url)) {
      this.#imageElement.remove();

      this.#videoElement.src = url;
      this.#videoElement.volume = 0;
      this.#videoElement.autoplay = true;
      this.#videoElement.loop = true;
      this.#videoElement.controls = true;

      this.container.append(this.#videoElement);

      return;
    }

    this.#videoElement.remove();

    this.#imageElement.src = url;

    this.container.append(this.#imageElement);
  }

  static #isVideoUrl(url: string): boolean {
    return url.endsWith('.mp4') || url.endsWith('.webm');
  }

  static #miscSettings = new MiscSettings();

  static #offsetProperty = '--offset';
  static #opacityProperty = '--opacity';
  static #shownState = 'shown';
  static #swipeState = 'swiped';
  static #minRequiredDistance = 50;

  static #previewSizes: Record<FullscreenViewerSize, string> = {
    full: 'Full',
    large: 'Large',
    medium: 'Medium',
    small: 'Small'
  }

  static #fallbackSize = 'large';
}
