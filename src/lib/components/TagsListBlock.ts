import { BaseComponent } from "$lib/components/base/BaseComponent";
import type TagGroup from "$entities/TagGroup";
import type { TagDropdownWrapper } from "$lib/components/TagDropdownWrapper";
import { on } from "$lib/components/events/comms";
import { eventFormEditorUpdated } from "$lib/components/events/tags-form-events";
import { getComponent } from "$lib/components/base/component-utils";
import { eventTagCustomGroupResolved } from "$lib/components/events/tag-dropdown-events";
import TagSettings from "$lib/extension/settings/TagSettings";

export class TagsListBlock extends BaseComponent {
  #tagsListContainer: HTMLElement | null = null;
  #tagSettings = new TagSettings();

  #shouldDisplaySeparation = false;

  #separatedGroups = new Map<string, TagGroup>();
  #separatedHeaders = new Map<string, HTMLElement>();
  #groupsCount = new Map<string, number>();
  #lastTagGroup = new WeakMap<TagDropdownWrapper, TagGroup | null>;

  #isReorderingPlanned = false;

  protected build() {
    this.#tagsListContainer = this.container.querySelector('.tag-list');
  }

  init() {
    this.#tagSettings.resolveGroupSeparation().then(this.#onTagSeparationChange.bind(this));
    this.#tagSettings.subscribe(settings => {
      this.#onTagSeparationChange(Boolean(settings.groupSeparation))
    });

    on(
      this,
      eventTagCustomGroupResolved,
      this.#onTagDropdownCustomGroupResolved.bind(this)
    );
  }

  #onTagSeparationChange(isSeparationEnabled: boolean) {
    if (this.#shouldDisplaySeparation === isSeparationEnabled) {
      return;
    }

    this.#shouldDisplaySeparation = isSeparationEnabled;
    this.#reorderSeparatedGroups();
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
  on(document, eventFormEditorUpdated, event => {
    const tagsListElement = event.detail.closest<HTMLElement>('#image_tags_and_source');

    if (!tagsListElement || getComponent(tagsListElement)) {
      return;
    }

    new TagsListBlock(tagsListElement)
      .initialize();
  });
}
