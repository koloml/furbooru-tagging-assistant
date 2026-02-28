import { writable } from "svelte/store";
import MiscPreferences from "$lib/extension/preferences/MiscPreferences";

export const fullScreenViewerEnabled = writable(true);

const preferences = new MiscPreferences();

Promise.allSettled([
  preferences.resolveFullscreenViewerEnabled().then(v => fullScreenViewerEnabled.set(v))
]).then(() => {
  fullScreenViewerEnabled.subscribe(value => {
    void preferences.setFullscreenViewerEnabled(value);
  });

  preferences.subscribe(settings => {
    fullScreenViewerEnabled.set(Boolean(settings.fullscreenViewer));
  });
});
