import { amdLite } from "amd-lite";

const originalDefine = amdLite.define;

amdLite.define = (name, dependencies, originalCallback) => {
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
