import {BaseComponent} from "$lib/components/base/BaseComponent.js";

export class FullscreenViewer extends BaseComponent {
  /** @type {HTMLVideoElement} */
  #videoElement = document.createElement('video');
  /** @type {HTMLImageElement} */
  #imageElement = document.createElement('img');

  #spinnerElement = document.createElement('i');

  /** @type {number|null} */
  #touchId = null;
  /** @type {number|null} */
  #startX = null;
  /** @type {number|null} */
  #startY = null;
  /** @type {boolean|null} */
  #isClosingSwipeStarted = null;

  /**
   * @protected
   */
  build() {
    this.container.classList.add('fullscreen-viewer');
    this.container.append(this.#spinnerElement);

    this.#spinnerElement.classList.add('spinner', 'fa', 'fa-circle-notch', 'fa-spin');
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
  }

  #onLoaded() {
    this.container.classList.remove('loading');
  }

  /**
   * @param {TouchEvent} event
   */
  #onTouchStart(event) {
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

  /**
   * @param {TouchEvent} event
   */
  #onTouchEnd(event) {
    if (this.#touchId === null) {
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

  /**
   * @param {TouchEvent} event
   */
  #onTouchMove(event) {
    if (this.#touchId === null) {
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

  /**
   * @param {KeyboardEvent} event
   */
  #onDocumentKeyPressed(event) {
    if (event.code === 'Escape' || event.code === 'Esc') {
      this.#close();
    }
  }

  #close() {
    this.container.classList.remove(FullscreenViewer.#shownState);
    document.body.style.overflow = null;

    requestAnimationFrame(() => {
      this.#videoElement.volume = 0;
      this.#videoElement.pause();
      this.#videoElement.remove();
    });
  }

  /**
   * @param {string} url
   */
  show(url) {
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

  /**
   * @param {string} url
   * @return {boolean}
   */
  static #isVideoUrl(url) {
    return url.endsWith('.mp4') || url.endsWith('.webm');
  }

  static #offsetProperty = '--offset';
  static #opacityProperty = '--opacity';
  static #shownState = 'shown';
  static #swipeState = 'swiped';
  static #minRequiredDistance = 50;
}
