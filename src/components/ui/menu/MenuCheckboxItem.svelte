<script lang="ts">
  import MenuLink from "$components/ui/menu/MenuItem.svelte";
  import type { Snippet } from "svelte";
  import type { FormEventHandler, MouseEventHandler } from "svelte/elements";

  interface MenuCheckboxItemProps {
    checked: boolean;
    name?: string;
    value?: string;
    href?: string;
    children?: Snippet;
    /**
     * Click event received by the checkbox input element.
     */
    onclick?: MouseEventHandler<HTMLInputElement>;
    oninput?: FormEventHandler<HTMLInputElement>;
    /**
     * Click event received by the menu item instead of the checkbox element.
     */
    onitemclick?: MouseEventHandler<HTMLElement>;
  }

  let checkboxElement: HTMLInputElement;

  let {
    checked = $bindable(),
    name = undefined,
    value = undefined,
    href = undefined,
    children,
    onclick,
    oninput,
    onitemclick,
  }: MenuCheckboxItemProps = $props();

  /**
   * Prevent clicks from getting sent to the menu link if user clicked directly on the checkbox.
   * @param originalEvent
   */
  function stopPropagationAndPassCallback(originalEvent: MouseEvent) {
    originalEvent.stopPropagation();
    onclick?.(originalEvent as MouseEvent & { currentTarget: HTMLInputElement });
  }

  /**
   * Check and try to toggle checkbox if href was not provided for the menu item.
   */
  function maybeToggleCheckboxOnOuterLinkClicked(event: MouseEvent) {
    // Call the event handler if present.
    if (onitemclick) {
      onitemclick(event as MouseEvent & {currentTarget: HTMLElement});

      // If it was prevented, then don't attempt to run checkbox toggling workaround.
      if (event.defaultPrevented) {
        return;
      }
    }

    // When menu link does not contain any link, we should just treat clicks on it as toggle action on checkbox.
    if (!href) {
      checked = !checked;

      // Since we've toggled it using the `checked` property and input does not trigger `onclick` when we do something
      // programmatically, we should create valid event and send it back to the parent component so it will handle
      // whatever it wants.
      if (oninput) {
        // Uhh, not sure if this is how it should be done, but we need `currentTarget` to point on the checkbox. Without
        // dispatching the event, we can't fill it normally. Also, input element does not return us untrusted input
        // events automatically. Probably should make the util function later in case I'd need something similar.
        checkboxElement.addEventListener('input', (inputEvent: Event) => {
          oninput(inputEvent as Event & { currentTarget: HTMLInputElement });
        }, { once: true })

        checkboxElement.dispatchEvent(new InputEvent('input'));
      }
    }
  }
</script>

<MenuLink {href} onclick={maybeToggleCheckboxOnOuterLinkClicked}>
  <input bind:this={checkboxElement}
         bind:checked={checked}
         {name}
         onclick={stopPropagationAndPassCallback}
         {oninput}
         type="checkbox"
         {value}>
  {@render children?.()}
</MenuLink>

<style lang="scss">
  :global(.menu-item) input {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    flex-shrink: 0;
  }
</style>
