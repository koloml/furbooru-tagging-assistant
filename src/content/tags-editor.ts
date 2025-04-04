import { TagsForm } from "$lib/components/TagsForm";
import { initializeAllTagsLists, watchForUpdatedTagLists } from "$lib/components/TagsListBlock";

initializeAllTagsLists();
watchForUpdatedTagLists();
TagsForm.watchForEditors();
