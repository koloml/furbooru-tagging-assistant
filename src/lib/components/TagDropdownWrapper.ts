import { BaseComponent } from "$lib/components/base/BaseComponent";
import MaintenanceProfile from "$entities/MaintenanceProfile";
import MaintenanceSettings from "$lib/extension/settings/MaintenanceSettings";
import { getComponent } from "$lib/components/base/component-utils";
import CustomCategoriesResolver from "$lib/extension/CustomCategoriesResolver";
import { on } from "$lib/components/events/comms";
import { eventFormEditorUpdated } from "$lib/components/events/tags-form-events";
import { eventTagCustomGroupResolved } from "$lib/components/events/tag-dropdown-events";
import type TagGroup from "$entities/TagGroup";

const categoriesResolver = new CustomCategoriesResolver();

export class TagDropdownWrapper extends BaseComponent {
  /**
   * Container with dropdown elements to insert options into.
   */
  #dropdownContainer: HTMLElement | null = null;

  /**
   * Button to add or remove the current tag into/from the active profile.
   */
  #toggleOnExistingButton: HTMLAnchorElement | null = null;

  /**
   * Button to create a new profile, make it active and add the current tag into the active profile.
   */
  #addToNewButton: HTMLAnchorElement | null = null;

  /**
   * Local clone of the currently active profile used for updating the list of tags.
   */
  #activeProfile: MaintenanceProfile | null = null;

  /**
   * Is cursor currently entered the dropdown.
   */
  #isEntered: boolean = false;

  #originalCategory: string | undefined | null = null;

  build() {
    this.#dropdownContainer = this.container.querySelector('.dropdown__content');
  }

  init() {
    this.on('mouseenter', this.#onDropdownEntered.bind(this));
    this.on('mouseleave', this.#onDropdownLeft.bind(this));

    TagDropdownWrapper.#watchActiveProfile(activeProfileOrNull => {
      this.#activeProfile = activeProfileOrNull;

      if (this.#isEntered) {
        this.#updateButtons();
      }
    });

    on(this, eventTagCustomGroupResolved, this.#onTagGroupResolved.bind(this));
  }

  #onTagGroupResolved(resolvedGroupEvent: CustomEvent<TagGroup | null>) {
    if (this.originalCategory) {
      return;
    }

    const maybeTagGroup = resolvedGroupEvent.detail;

    if (!maybeTagGroup) {
      this.tagCategory = this.originalCategory;
      return;
    }

    this.tagCategory = maybeTagGroup.settings.category;
  }

  get tagName() {
    return this.container.dataset.tagName;
  }

  /**
   * @return {string|undefined}
   */
  get tagCategory() {
    return this.container.dataset.tagCategory;
  }

  /**
   * @param {string|undefined} targetCategory
   */
  set tagCategory(targetCategory) {
    // Make sure original category is properly stored.
    this.originalCategory;

    this.container.dataset.tagCategory = targetCategory;

    if (targetCategory) {
      this.container.setAttribute('data-tag-category', targetCategory);
      return;
    }

    this.container.removeAttribute('data-tag-category');
  }

  /**
   * @return {string|undefined}
   */
  get originalCategory() {
    if (this.#originalCategory === null) {
      this.#originalCategory = this.tagCategory;
    }

    return this.#originalCategory;
  }

  #onDropdownEntered() {
    this.#isEntered = true;
    this.#updateButtons();
  }

  #onDropdownLeft() {
    this.#isEntered = false;
  }

  #updateButtons() {
    if (!this.#activeProfile) {
      this.#addToNewButton ??= TagDropdownWrapper.#createDropdownLink(
        'Add to new tagging profile',
        this.#onAddToNewClicked.bind(this)
      );

      if (!this.#addToNewButton.isConnected) {
        this.#dropdownContainer?.append(this.#addToNewButton);
      }
    } else {
      this.#addToNewButton?.remove();
    }

    if (this.#activeProfile) {
      this.#toggleOnExistingButton ??= TagDropdownWrapper.#createDropdownLink(
        'Add to existing tagging profile',
        this.#onToggleInExistingClicked.bind(this)
      );

      const profileName = this.#activeProfile.settings.name;
      let profileSpecificButtonText = `Add to profile "${profileName}"`;
      const tagName = this.tagName;

      if (tagName && this.#activeProfile.settings.tags.includes(tagName)) {
        profileSpecificButtonText = `Remove from profile "${profileName}"`;
      }

      this.#toggleOnExistingButton.innerText = profileSpecificButtonText;

      if (!this.#toggleOnExistingButton.isConnected) {
        this.#dropdownContainer?.append(this.#toggleOnExistingButton);
      }

      return;
    }

    this.#toggleOnExistingButton?.remove();
  }

  async #onAddToNewClicked() {
    const tagName = this.tagName;

    if (!tagName) {
      throw new Error('Missing tag name to create the profile!');
    }

    const profile = new MaintenanceProfile(crypto.randomUUID(), {
      name: 'Temporary Profile (' + (new Date().toISOString()) + ')',
      tags: [this.tagName],
      temporary: true,
    });

    await profile.save();
    await TagDropdownWrapper.#maintenanceSettings.setActiveProfileId(profile.id);
  }

  async #onToggleInExistingClicked() {
    if (!this.#activeProfile) {
      return;
    }

    const tagsList = new Set(this.#activeProfile.settings.tags);
    const targetTagName = this.tagName;

    if (!targetTagName) {
      throw new Error('Missing tag name!');
    }

    if (tagsList.has(targetTagName)) {
      tagsList.delete(targetTagName);
    } else {
      tagsList.add(targetTagName);
    }

    this.#activeProfile.settings.tags = Array.from(tagsList.values());

    await this.#activeProfile.save();
  }

  static #maintenanceSettings = new MaintenanceSettings();

  /**
   * Watch for changes to active profile.
   * @param onActiveProfileChange Callback to call when profile was
   * changed.
   */
  static #watchActiveProfile(onActiveProfileChange: (profile: MaintenanceProfile | null) => void) {
    let lastActiveProfile: string | null = null;

    this.#maintenanceSettings.subscribe((settings) => {
      lastActiveProfile = settings.activeProfile ?? null;

      this.#maintenanceSettings
        .resolveActiveProfileAsObject()
        .then(onActiveProfileChange);
    });

    MaintenanceProfile.subscribe(profiles => {
      const activeProfile = profiles
        .find(profile => profile.id === lastActiveProfile);

      onActiveProfileChange(activeProfile ?? null
      );
    });

    this.#maintenanceSettings
      .resolveActiveProfileAsObject()
      .then(activeProfile => {
        lastActiveProfile = activeProfile?.id ?? null;
        onActiveProfileChange(activeProfile);
      });
  }

  /**
   * Create element for dropdown.
   * @param text Base text for the option.
   * @param onClickHandler Click handler. Event will be prevented by default.
   * @return
   */
  static #createDropdownLink(text: string, onClickHandler: (event: MouseEvent) => void): HTMLAnchorElement {
    const dropdownLink = document.createElement('a');
    dropdownLink.href = '#';
    dropdownLink.innerText = text;
    dropdownLink.className = 'tag__dropdown__link';

    dropdownLink.addEventListener('click', event => {
      event.preventDefault();
      onClickHandler(event);
    });

    return dropdownLink;
  }
}

export function wrapTagDropdown(element: HTMLElement) {
  // Skip initialization when tag component is already wrapped
  if (getComponent(element)) {
    return;
  }

  const tagDropdown = new TagDropdownWrapper(element);
  tagDropdown.initialize();

  categoriesResolver.addElement(tagDropdown);
}

const processedElementsSet = new WeakSet<HTMLElement>();

export function watchTagDropdownsInTagsEditor() {
  // We only need to watch for new editor elements if there is a tag editor present on the page
  if (!document.querySelector('#image_tags_and_source')) {
    return;
  }

  document.body.addEventListener('mouseover', event => {
    const targetElement = event.target;

    if (!(targetElement instanceof HTMLElement)) {
      return;
    }

    if (processedElementsSet.has(targetElement)) {
      return;
    }

    const closestTagEditor = targetElement.closest<HTMLElement>('#image_tags_and_source');

    if (!closestTagEditor || processedElementsSet.has(closestTagEditor)) {
      processedElementsSet.add(targetElement);
      return;
    }

    processedElementsSet.add(targetElement);
    processedElementsSet.add(closestTagEditor);

    for (const tagDropdownElement of closestTagEditor.querySelectorAll<HTMLElement>('.tag.dropdown')) {
      wrapTagDropdown(tagDropdownElement);
    }
  });

  // When form is submitted, its DOM is completely updated. We need to fetch those tags in this case.
  on(document.body, eventFormEditorUpdated, event => {
    for (const tagDropdownElement of event.detail.querySelectorAll<HTMLElement>('.tag.dropdown')) {
      wrapTagDropdown(tagDropdownElement);
    }
  });
}
