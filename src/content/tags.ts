import { watchTagDropdownsInTagsEditor, wrapTagDropdown } from "$content/components/TagDropdownWrapper";

for (let tagDropdownElement of document.querySelectorAll<HTMLElement>('.tag.dropdown')) {
  wrapTagDropdown(tagDropdownElement);
}

watchTagDropdownsInTagsEditor();
