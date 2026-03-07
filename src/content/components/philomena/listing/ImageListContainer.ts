import { BaseComponent } from "$content/components/base/BaseComponent";
import { ImageListInfo } from "$content/components/philomena/listing/ImageListInfo";

export class ImageListContainer extends BaseComponent {
  #info: ImageListInfo | null = null;

  protected build() {
    const imageListInfoContainer = this.container.querySelector<HTMLElement>('.js-imagelist-info');

    if (imageListInfoContainer) {
      this.#info = new ImageListInfo(imageListInfoContainer);
      this.#info.initialize();
    }
  }

  static findAndInitialize() {
    const imageListContainer = document.querySelector<HTMLElement>('#imagelist-container');

    if (imageListContainer) {
      new ImageListContainer(imageListContainer).initialize();
    }
  }
}
