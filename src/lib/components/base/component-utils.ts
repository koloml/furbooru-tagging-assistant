import type { BaseComponent } from "$lib/components/base/BaseComponent";

const instanceSymbol = Symbol.for('instance');

interface ElementWithComponent<T> extends HTMLElement {
  [instanceSymbol]?: T;
}

/**
 * Get the component from the element, if there is one.
 * @param {HTMLElement} element
 * @return
 */
export function getComponent<T extends BaseComponent = BaseComponent>(element: ElementWithComponent<T>): T | null {
  return element[instanceSymbol] || null;
}

/**
 * Bind the component to the selected element.
 * @param element The element to bind the component to.
 * @param instance The component instance.
 */
export function bindComponent<T extends BaseComponent = BaseComponent>(element: ElementWithComponent<T>, instance: T): void {
  if (element[instanceSymbol]) {
    throw new Error('The element is already bound to a component.');
  }

  element[instanceSymbol] = instance;
}
