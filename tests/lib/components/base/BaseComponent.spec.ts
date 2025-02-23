import { BaseComponent } from "$lib/components/base/BaseComponent";
import { getComponent } from "$lib/components/base/component-utils";

function randomString() {
  return crypto.randomUUID();
}

describe('BaseComponent', () => {
  it('should bind the component to the element', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    expect(getComponent(element)).toBe(component);
  });

  it('should throw an error when attempting to initialize component on same element multiple times', () => {
    const element = document.createElement('div');

    expect(() => new BaseComponent(element)).not.toThrowError();
    expect(() => new BaseComponent(element)).toThrowError();
  });

  it('should return the element as component container', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    expect(component.container).toBe(element);
  });

  it('should mark itself as initialized after initialization', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    expect(component.isInitialized).toBe(false);
    component.initialize();
    expect(component.isInitialized).toBe(true);
  });

  it('should throw error when attempting to initialize component multiple times', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    expect(() => component.initialize()).not.toThrowError();
    expect(() => component.initialize()).toThrowError();
  });

  it('should emit custom events on element', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    let receivedEvent: CustomEvent<string> | null = null;

    const eventName = randomString();
    const eventData = randomString();
    const eventHandler = vi.fn(event => {
      receivedEvent = event;
    });

    element.addEventListener(eventName, eventHandler);
    component.emit(eventName, eventData);

    expect(eventHandler).toBeCalled();
    expect(receivedEvent).toBeInstanceOf(CustomEvent);
    expect(receivedEvent!.detail).toBe(eventData);
  });

  it('should listen events on element', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    const eventName = 'click';
    const eventHandler = vi.fn();

    component.on(eventName, eventHandler);
    element.dispatchEvent(new Event(eventName));
    expect(eventHandler).toBeCalled();
  });

  it('should disconnect listener with unsubscribe function', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    const eventName = 'click';
    const eventHandler = vi.fn();

    const unsubscribe = component.on(eventName, eventHandler);

    element.dispatchEvent(new Event(eventName));
    unsubscribe();
    element.dispatchEvent(new Event(eventName));

    expect(eventHandler).toBeCalledTimes(1);
  });

  it('should listen for event once', () => {
    const element = document.createElement('div');
    const component = new BaseComponent(element);

    const eventName = 'click';
    const eventHandler = vi.fn();

    component.once(eventName, eventHandler);

    element.dispatchEvent(new Event(eventName));
    element.dispatchEvent(new Event(eventName));

    expect(eventHandler).toBeCalledTimes(1);
  });
});
