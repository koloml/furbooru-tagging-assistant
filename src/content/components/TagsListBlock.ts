import { BaseComponent } from "$content/components/base/BaseComponent";
import type TagGroup from "$entities/TagGroup";
import type { TagDropdownWrapper } from "$content/components/TagDropdownWrapper";
import { on } from "$content/components/events/comms";
import { EVENT_FORM_EDITOR_UPDATED } from "$content/components/events/tags-form-events";
import { getComponent } from "$content/components/base/component-utils";
import { EVENT_TAG_GROUP_RESOLVED } from "$content/components/events/tag-dropdown-events";
import TagSettings from "$lib/extension/settings/TagSettings";

export class TagsListBlock extends BaseComponent {
  #tagsListButtonsContainer: HTMLElement | null = null;
  #tagsListContainer: HTMLElement | null = null;

  #toggleGroupingButton = document.createElement('a');
  #toggleGroupingButtonIcon = document.createElement('i');

  #tagSettings = new TagSettings();

  #shouldDisplaySeparation = false;

  #separatedGroups = new Map<string, TagGroup>();
  #separatedHeaders = new Map<string, HTMLElement>();
  #groupsCount = new Map<string, number>();
  #lastTagGroup = new WeakMap<TagDropdownWrapper, TagGroup | null>;

  #isReorderingPlanned = false;

  protected build() {
    this.#tagsListButtonsContainer = this.container.querySelector('.block.tagsauce .block__header__buttons');
    this.#tagsListContainer = this.container.querySelector('.tag-list');

    this.#toggleGroupingButton.innerText = ' Grouping';
    this.#toggleGroupingButton.href = 'javascript:void(0)';
    this.#toggleGroupingButton.classList.add('button', 'button--link', 'button--inline');
    this.#toggleGroupingButton.title = 'Toggle the global groups separation option. This will only toggle global ' +
      'setting without changing the separation of specific groups.';

    this.#toggleGroupingButtonIcon.classList.add('fas', TagsListBlock.#iconGroupingDisabled);
    this.#toggleGroupingButton.prepend(this.#toggleGroupingButtonIcon);

    if (this.#tagsListButtonsContainer) {
      this.#tagsListButtonsContainer.append(this.#toggleGroupingButton);
    }
  }

  init() {
    this.#tagSettings.resolveGroupSeparation().then(this.#onTagSeparationChange.bind(this));
    this.#tagSettings.subscribe(settings => {
      this.#onTagSeparationChange(Boolean(settings.groupSeparation))
    });

    on(
      this,
      EVENT_TAG_GROUP_RESOLVED,
      this.#onTagDropdownCustomGroupResolved.bind(this)
    );

    this.#toggleGroupingButton.addEventListener('click', this.#onToggleGroupingClicked.bind(this));
  }

  #onTagSeparationChange(isSeparationEnabled: boolean) {
    if (this.#shouldDisplaySeparation === isSeparationEnabled) {
      return;
    }

    this.#shouldDisplaySeparation = isSeparationEnabled;
    this.#reorderSeparatedGroups();
    this.#updateToggleSeparationButton();
  }

  #updateToggleSeparationButton() {
    this.#toggleGroupingButtonIcon.classList.toggle(TagsListBlock.#iconGroupingEnabled, this.#shouldDisplaySeparation);
    this.#toggleGroupingButtonIcon.classList.toggle(TagsListBlock.#iconGroupingDisabled, !this.#shouldDisplaySeparation);
  }

  #onTagDropdownCustomGroupResolved(resolvedCustomGroupEvent: CustomEvent<TagGroup | null>) {
    const maybeDropdownElement = resolvedCustomGroupEvent.target;

    if (!(maybeDropdownElement instanceof HTMLElement)) {
      return;
    }

    const tagDropdown = getComponent<TagDropdownWrapper>(maybeDropdownElement);

    if (!tagDropdown) {
      return;
    }

    const tagGroup = resolvedCustomGroupEvent.detail;

    if (tagGroup) {
      this.#handleTagGroupChanges(tagGroup);
    }

    this.#handleResolvedTagGroup(tagGroup, tagDropdown);

    if (!this.#isReorderingPlanned) {
      this.#isReorderingPlanned = true;

      requestAnimationFrame(this.#reorderSeparatedGroups.bind(this));
    }
  }

  #onToggleGroupingClicked(event: Event) {
    event.preventDefault();
    void this.#tagSettings.setGroupSeparation(!this.#shouldDisplaySeparation);
  }

  #handleTagGroupChanges(tagGroup: TagGroup) {
    const groupId = tagGroup.id;
    const processedGroup = this.#separatedGroups.get(groupId);

    if (!tagGroup.settings.separate && processedGroup) {
      this.#separatedGroups.delete(groupId);
      this.#separatedHeaders.get(groupId)?.remove();
      this.#separatedHeaders.delete(groupId);
      return;
    }

    // Every time group is updated, a new object is being initialized
    if (tagGroup !== processedGroup) {
      this.#createOrUpdateHeaderForGroup(tagGroup);
      this.#separatedGroups.set(groupId, tagGroup);
    }
  }

  #createOrUpdateHeaderForGroup(group: TagGroup) {
    let heading = this.#separatedHeaders.get(group.id);

    if (!heading) {
      heading = document.createElement('h2');

      // Heading is hidden by default and shown on next frame if there are tags to show in the section.
      heading.style.display = 'none';
      heading.style.order = `var(${TagsListBlock.#orderCssVariableForGroup(group.id)}, 0)`;
      heading.style.flexBasis = '100%';
      heading.classList.add('tag-category-headline');

      // We're inserting heading to the top just to make sure that heading is always in front of the tags related to
      // this category.
      this.#tagsListContainer?.insertAdjacentElement('afterbegin', heading);

      this.#separatedHeaders.set(group.id, heading);
    }

    heading.innerText = group.settings.name;
  }

  #handleResolvedTagGroup(resolvedGroup: TagGroup | null, tagComponent: TagDropdownWrapper) {
    const previousGroupId = this.#lastTagGroup.get(tagComponent)?.id;
    const currentGroupId = resolvedGroup?.id;
    const isDifferentId = currentGroupId !== previousGroupId;
    const isSeparationEnabled = resolvedGroup?.settings.separate;

    if (isDifferentId) {
      // Make sure to subtract the element from counters if there was a count before.
      if (previousGroupId && this.#groupsCount.has(previousGroupId)) {
        this.#groupsCount.set(previousGroupId, this.#groupsCount.get(previousGroupId)! - 1);
      }

      // We only need to count groups which have separation enabled.
      if (currentGroupId && isSeparationEnabled) {
        const count = this.#groupsCount.get(resolvedGroup.id) ?? 0;
        this.#groupsCount.set(currentGroupId, count + 1);
      }
    }

    // We're adding the CSS order for the tag as the CSS variable. This variable is updated later.
    if (currentGroupId && isSeparationEnabled) {
      tagComponent.container.style.order = `var(${TagsListBlock.#orderCssVariableForGroup(currentGroupId)}, 0)`;
    } else {
      tagComponent.container.style.removeProperty('order');
    }

    // If separation is disabled in the new group, then we should remove the tag from map, so it can be recaptured
    // when tag group is getting enabled later.
    if (currentGroupId && !isSeparationEnabled) {
      this.#lastTagGroup.delete(tagComponent);
      return;
    }

    // Mark this tag component as related to the following group.
    this.#lastTagGroup.set(tagComponent, resolvedGroup);
  }

  #reorderSeparatedGroups() {
    this.#isReorderingPlanned = false;

    const tagGroups = Array.from(this.#separatedGroups.values())
      .toSorted((a, b) => a.settings.name.localeCompare(b.settings.name));

    for (let index = 0; index < tagGroups.length; index++) {
      const tagGroup = tagGroups[index];
      const groupId = tagGroup.id;
      const usedCount = this.#groupsCount.get(groupId);
      const relatedHeading = this.#separatedHeaders.get(groupId);

      if (this.#shouldDisplaySeparation) {
        this.container.style.setProperty(TagsListBlock.#orderCssVariableForGroup(groupId), (index + 1).toString());
      } else {
        this.container.style.removeProperty(TagsListBlock.#orderCssVariableForGroup(groupId));
      }

      if (relatedHeading) {
        if (!this.#shouldDisplaySeparation || !usedCount || usedCount <= 0) {
          relatedHeading.style.display = 'none';
        } else {
          relatedHeading.style.removeProperty('display');
        }
      }
    }
  }

  static #orderCssVariableForGroup(groupId: string): string {
    return `--ta-order-${groupId}`;
  }

  static #iconGroupingDisabled = 'fa-folder';
  static #iconGroupingEnabled = 'fa-folder-tree';
}

export function initializeAllTagsLists() {
  for (let element of document.querySelectorAll<HTMLElement>('#image_tags_and_source')) {
    if (getComponent(element)) {
      return;
    }

    new TagsListBlock(element)
      .initialize();
  }
}

export function watchForUpdatedTagLists() {
  on(document, EVENT_FORM_EDITOR_UPDATED, event => {
    const tagsListElement = event.detail.closest<HTMLElement>('#image_tags_and_source');

    if (!tagsListElement || getComponent(tagsListElement)) {
      return;
    }

    new TagsListBlock(tagsListElement)
      .initialize();
  });
}
