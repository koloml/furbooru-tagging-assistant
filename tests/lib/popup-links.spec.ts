import { randomString } from "$tests/utils";
import { initializeLinksReplacement } from "$lib/popup-links";

describe('popup-links', () => {
  let expectedPath = '';
  let testLink: HTMLAnchorElement = document.createElement('a');
  let disconnectCallback: (() => void) | null = null;

  function fireEventAt(target: EventTarget, eventName: string) {
    target.dispatchEvent(new Event(eventName, {bubbles: true}));
  }

  beforeEach(() => {
    expectedPath = `/test/${randomString()}`;
    testLink.href = expectedPath;
    document.body.append(testLink);
  });

  afterEach(() => {
    if (disconnectCallback) {
      disconnectCallback();
      disconnectCallback = null;
    }
  });

  it('should replace link on any mouse button down', () => {
    disconnectCallback = initializeLinksReplacement();
    fireEventAt(testLink, "mousedown");

    const resultUrl = new URL(testLink.href);

    expect(resultUrl.searchParams.get('path')).toBe(expectedPath);
  });

  it('should replace link when link is pressed by keyboard or clicked', () => {
    disconnectCallback = initializeLinksReplacement();
    fireEventAt(testLink, "click");

    const resultUrl = new URL(testLink.href);

    expect(resultUrl.searchParams.get('path')).toBe(expectedPath);
  });

  it('should not replace already replaced links', () => {
    disconnectCallback = initializeLinksReplacement();
    fireEventAt(testLink, "click");
    const hrefAfterFirstClick = testLink.href;

    fireEventAt(testLink, "click");
    const hrefAfterSecondClick = testLink.href;

    expect(hrefAfterFirstClick).toBe(hrefAfterSecondClick);
  });

  it('should stop replacing links once disconnect is called', () => {
    const hrefBefore = testLink.href;

    disconnectCallback = initializeLinksReplacement();
    disconnectCallback();
    fireEventAt(testLink, "mousedown");
    fireEventAt(testLink, "click");

    expect(hrefBefore).toBe(testLink.href);
  });

  it('should not touch links with different origin', () => {
    testLink.href = "https://external.example.com/" + randomString() + "/";

    const hrefBefore = testLink.href;
    disconnectCallback = initializeLinksReplacement();
    fireEventAt(testLink, "click");

    expect(testLink.href).toBe(hrefBefore);
  });
});
