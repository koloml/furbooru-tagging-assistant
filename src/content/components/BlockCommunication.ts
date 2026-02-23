import { BaseComponent } from "$content/components/base/BaseComponent";
import TagSettings from "$lib/extension/settings/TagSettings";
import { getComponent } from "$content/components/base/component-utils";
import { decodeTagNameFromLink, resolveTagCategoryFromTagName } from "$lib/booru/tag-utils";

export class BlockCommunication extends BaseComponent {
  #contentSection: HTMLElement | null = null;
  #tagLinks: HTMLAnchorElement[] = [];

  #tagLinksReplaced: boolean | null = null;

  protected build() {
    this.#contentSection = this.container.querySelector('.communication__content');
    this.#tagLinks = this.#findAllTagLinks();
  }

  protected init() {
    BlockCommunication.#tagSettings.resolveReplaceLinks().then(this.#onReplaceLinkSettingResolved.bind(this));
    BlockCommunication.#tagSettings.subscribe(settings => {
      this.#onReplaceLinkSettingResolved(settings.replaceLinks ?? false);
    });
  }

  #onReplaceLinkSettingResolved(haveToReplaceLinks: boolean) {
    if (!this.#tagLinks.length || this.#tagLinksReplaced === haveToReplaceLinks) {
      return;
    }

    for (const linkElement of this.#tagLinks) {
      linkElement.classList.toggle('tag', haveToReplaceLinks);

      // Sometimes tags are being decorated with the code block inside. It should be fine to replace it right away.
      if (linkElement.childElementCount === 1 && linkElement.children[0].tagName === 'CODE') {
        linkElement.textContent = linkElement.children[0].textContent;
      }

      if (haveToReplaceLinks) {
        const maybeDecodedTagName = decodeTagNameFromLink(linkElement.pathname) ?? '';
        linkElement.dataset.tagCategory = resolveTagCategoryFromTagName(maybeDecodedTagName) ?? '';
      } else {
        linkElement.dataset.tagCategory = '';
      }
    }

    this.#tagLinksReplaced = haveToReplaceLinks;
  }

  #findAllTagLinks(): HTMLAnchorElement[] {
    return Array
      .from(this.#contentSection?.querySelectorAll('a') || [])
      .filter(link => link.pathname.startsWith('/tags/'))
  }

  static #tagSettings = new TagSettings();

  static findAndInitializeAll() {
    for (const container of document.querySelectorAll<HTMLElement>('.block.communication')) {
      if (getComponent(container)) {
        continue;
      }

      new BlockCommunication(container).initialize();
    }
  }
}
