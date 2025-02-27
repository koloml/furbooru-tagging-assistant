function resolveReplaceableLink(target: EventTarget | null = null): HTMLAnchorElement | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const closestLink = target.closest('a');

  if (
    closestLink instanceof HTMLAnchorElement
    && !closestLink.search
    && closestLink.origin === location.origin
  ) {
    return closestLink;
  }

  return null;
}

function replaceLink(linkElement: HTMLAnchorElement) {
  const params = new URLSearchParams([
    ['path', linkElement.pathname]
  ]);

  linkElement.search = params.toString();
  linkElement.pathname = "/index.html";
}

export function initializeLinksReplacement(): () => void {
  const abortController = new AbortController();
  const replacementHandler = (event: Event) => {
    const closestLink = resolveReplaceableLink(event.target);

    if (closestLink) {
      replaceLink(closestLink);
    }
  }

  // Dynamically replace the links from the Svelte default links to the links usable for the popup.
  document.body.addEventListener('mousedown', replacementHandler, {
    signal: abortController.signal,
  });

  document.body.addEventListener('click', replacementHandler, {
    signal: abortController.signal,
  })

  return () => abortController.abort();
}
