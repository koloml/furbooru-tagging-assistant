import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";

export class TagsForm extends BaseComponent {
  /**
   * Collect all the tag categories available on the page and color the tags in the editor according to them.
   */
  refreshTagColors() {
    const tagCategories = this.#gatherTagCategories();
    const editableTags = this.container.querySelectorAll<HTMLElement>('.tag');

    for (const tagElement of editableTags) {
      // Tag name is stored in the "remove" link and not in the tag itself.
      const removeLink = tagElement.querySelector('a');

      if (!removeLink) {
        continue;
      }

      const tagName = removeLink.dataset.tagName;

      if (!tagName || !tagCategories.has(tagName)) {
        continue;
      }

      const categoryName = tagCategories.get(tagName)!;

      tagElement.dataset.tagCategory = categoryName;
      tagElement.setAttribute('data-tag-category', categoryName);
    }
  }

  /**
   * Collect list of categories from the tags on the page.
   * @return
   */
  #gatherTagCategories(): Map<string, string> {
    const tagCategories: Map<string, string> = new Map();

    for (const tagElement of document.querySelectorAll<HTMLElement>('.tag[data-tag-name][data-tag-category]')) {
      const tagName = tagElement.dataset.tagName;
      const tagCategory = tagElement.dataset.tagCategory;

      if (!tagName || !tagCategory) {
        console.warn('Missing tag name or category!');
        continue;
      }

      tagCategories.set(tagName, tagCategory);
    }

    return tagCategories;
  }

  static watchForEditors() {
    document.body.addEventListener('click', event => {
      const targetElement = event.target;

      if (!(targetElement instanceof HTMLElement)) {
        return;
      }

      const tagEditorWrapper = targetElement.closest('#image_tags_and_source');

      if (!tagEditorWrapper) {
        return;
      }

      const refreshTrigger = targetElement.closest<HTMLElement>('.js-taginput-show, #edit-tags')

      if (!refreshTrigger) {
        return;
      }

      const tagFormElement = tagEditorWrapper.querySelector<HTMLElement>('#tags-form');

      if (!tagFormElement) {
        return;
      }

      let tagEditor = getComponent(tagFormElement);

      if (!tagEditor || !(tagEditor instanceof TagsForm)) {
        tagEditor = new TagsForm(tagFormElement);
        tagEditor.initialize();
      }

      (tagEditor as TagsForm).refreshTagColors();
    });
  }
}
