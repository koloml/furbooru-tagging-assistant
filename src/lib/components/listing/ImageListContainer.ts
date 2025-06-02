import { BaseComponent } from "$lib/components/base/BaseComponent";
import { ImageListInfo } from "$lib/components/listing/ImageListInfo";

export class ImageListContainer extends BaseComponent {
  #info: ImageListInfo | null = null;

  protected build() {
    const imageListInfoContainer = this.container.querySelector<HTMLElement>('.js-imagelist-info');

    if (imageListInfoContainer) {
      this.#info = new ImageListInfo(imageListInfoContainer);
      this.#info.initialize();
    }
  }
}

export function initializeImageListContainer(element: HTMLElement) {
  new ImageListContainer(element).initialize();
}
