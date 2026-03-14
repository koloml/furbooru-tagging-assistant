import { type Writable, writable } from "svelte/store";
import TagEditorPreset from "$entities/TagEditorPreset";

export const tagEditorPresets: Writable<TagEditorPreset[]> = writable([]);

TagEditorPreset
  .readAll()
  .then(presets => tagEditorPresets.set(presets))
  .then(() => {
    TagEditorPreset.subscribe(presets => tagEditorPresets.set(presets))
  });
