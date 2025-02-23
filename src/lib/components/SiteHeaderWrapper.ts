import { BaseComponent } from "$lib/components/base/BaseComponent";
import { SearchWrapper } from "$lib/components/SearchWrapper";

class SiteHeaderWrapper extends BaseComponent {
  #searchWrapper: SearchWrapper | null = null;

  build() {
    const searchForm = this.container.querySelector<HTMLElement>('.header__search');
    this.#searchWrapper = searchForm && new SearchWrapper(searchForm) || null;
  }

  init() {
    if (this.#searchWrapper) {
      this.#searchWrapper.initialize();
    }
  }
}

export function initializeSiteHeader(siteHeaderElement: HTMLElement) {
  new SiteHeaderWrapper(siteHeaderElement)
    .initialize();
}
