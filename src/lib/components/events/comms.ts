import type { MaintenancePopupEventsMap } from "$lib/components/events/maintenance-popup-events";
import { BaseComponent } from "$lib/components/base/BaseComponent";
import type { FullscreenViewerEventsMap } from "$lib/components/events/fullscreen-viewer-events";
import type { BooruEventsMap } from "$lib/components/events/booru-events";
import type { TagsFormEventsMap } from "$lib/components/events/tags-form-events";
import type { TagDropdownEvents } from "$lib/components/events/tag-dropdown-events";

type EventsMapping =
  MaintenancePopupEventsMap
  & FullscreenViewerEventsMap
  & BooruEventsMap
  & TagsFormEventsMap
  & TagDropdownEvents;

type EventCallback<EventDetails> = (event: CustomEvent<EventDetails>) => void;
export type UnsubscribeFunction = () => void;
type ResolvableTarget = EventTarget | BaseComponent;

function resolveTarget(componentOrElement: ResolvableTarget): EventTarget {
  if (componentOrElement instanceof BaseComponent) {
    return componentOrElement.container;
  }

  return componentOrElement;
}

export function emit<Event extends keyof EventsMapping>(
  targetOrComponent: ResolvableTarget,
  event: Event,
  details: EventsMapping[Event]
) {
  const target = resolveTarget(targetOrComponent);

  target.dispatchEvent(
    new CustomEvent(event, {
      detail: details,
      bubbles: true
    })
  );
}

export function on<Event extends keyof EventsMapping>(
  targetOrComponent: ResolvableTarget,
  eventName: Event,
  callback: EventCallback<EventsMapping[Event]>,
  options: AddEventListenerOptions | null = null
): UnsubscribeFunction {
  const target = resolveTarget(targetOrComponent);
  const controller = new AbortController();

  target.addEventListener(
    eventName,
    callback as EventListener,
    {
      signal: controller.signal,
      once: options?.once
    }
  );

  return () => controller.abort();
}

const onceOptions = {once: true};

export function once<Event extends keyof EventsMapping>(
  targetOrComponent: ResolvableTarget,
  eventName: Event,
  callback: EventCallback<EventsMapping[Event]>
): UnsubscribeFunction {
  return on(
    targetOrComponent,
    eventName,
    callback,
    onceOptions
  );
}

class TargetedEmitter {
  readonly #element: ResolvableTarget;

  constructor(targetOrComponent: ResolvableTarget) {
    this.#element = targetOrComponent;
  }

  emit<Event extends keyof EventsMapping>(eventName: Event, details: EventsMapping[Event]): void {
    emit(this.#element, eventName, details);
  }

  on<Event extends keyof EventsMapping>(eventName: Event, callback: EventCallback<EventsMapping[Event]>, options: AddEventListenerOptions | null = null): UnsubscribeFunction {
    return on(this.#element, eventName, callback, options);
  }

  once<Event extends keyof EventsMapping>(eventName: Event, callback: EventCallback<EventsMapping[Event]>): UnsubscribeFunction {
    return once(this.#element, eventName, callback);
  }
}

export function emitterAt(targetOrComponent: ResolvableTarget): TargetedEmitter {
  return new TargetedEmitter(targetOrComponent);
}
