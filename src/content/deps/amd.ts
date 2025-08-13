import { amdLite } from "amd-lite";

const originalDefine = amdLite.define;

/**
 * Set of already defined modules. Used for deduplication.
 */
const definedModules = new Set<string>();

amdLite.define = (name, dependencies, originalCallback) => {
  // Chrome doesn't run the same content script multiple times, while Firefox does. Since each content script and their
  // chunks are intended to be run only once, we should just ignore any attempts of running the same module more than
  // once. Names of the modules are assumed to be unique.
  if (definedModules.has(name)) {
    return;
  }

  definedModules.add(name);

  return originalDefine(name, dependencies, function () {
    const callbackResult = originalCallback(...arguments);

    // Workaround for the entry script not returning anything causing AMD-Lite to send warning about modules not
    // being loaded/not existing.
    return typeof callbackResult !== 'undefined' ? callbackResult : {};
  })
}

amdLite.init({
  publicScope: window
});

// We don't have anything asynchronous, so it's safe to execute everything on the next frame.
requestAnimationFrame(() => {
  amdLite.resolveDependencies(Object.keys(amdLite.waitingModules))
});
