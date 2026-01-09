import { TagsForm } from "$content/components/TagsForm";
import { initializeAllTagsLists, watchForUpdatedTagLists } from "$content/components/TagsListBlock";

initializeAllTagsLists();
watchForUpdatedTagLists();
TagsForm.watchForEditors();
