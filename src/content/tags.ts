import { watchTagDropdownsInTagsEditor, wrapTagDropdown } from "$lib/components/TagDropdownWrapper";

for (let tagDropdownElement of document.querySelectorAll<HTMLElement>('.tag.dropdown')) {
  wrapTagDropdown(tagDropdownElement);
}

watchTagDropdownsInTagsEditor();
