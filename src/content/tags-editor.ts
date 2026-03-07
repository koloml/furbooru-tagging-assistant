import { TagsForm } from "$content/components/philomena/TagsForm";
import { TagsListBlock } from "$content/components/philomena/TagsListBlock";

TagsListBlock.initializeAll();
TagsListBlock.watchUpdatedLists();
TagsForm.watchForEditors();
