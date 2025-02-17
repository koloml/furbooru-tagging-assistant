<script lang="ts">
  import type { EventHandler } from "svelte/elements";

  interface TagEditorProps {
    // List of tags to edit. Any duplicated tags present in the array will be removed on the first edit.
    tags?: string[];
  }

  let {
    tags = $bindable([])
  }: TagEditorProps = $props();

  let uniqueTags = $state<Set<string>>(new Set());

  $effect.pre(() => {
    uniqueTags = new Set(tags);
  });

  let addedTagName = $state<string>('');

  /**
   * Create a callback function to pass into both mouse & keyboard events for tag removal.
   * @param tagName Name to remove when clicked.
   * @return Callback to pass as event listener.
   */
  function createTagRemoveHandler(tagName: string): EventHandler<Event, HTMLElement> {
    return event => {
      if (event.type === 'click') {
        removeTag(tagName);
      }

      if (event instanceof KeyboardEvent && (event.code === 'Enter' || event.code === 'Space')) {
        // To be more comfortable, automatically focus next available tag's remove button in the list.
        if (event.currentTarget instanceof HTMLElement) {
          const currenTagElement = event.currentTarget.closest('.tag');
          const nextTagElement = currenTagElement?.previousElementSibling ?? currenTagElement?.parentElement?.firstElementChild;
          const nextRemoveButton = nextTagElement?.querySelector('.remove');

          if (nextRemoveButton instanceof HTMLElement) {
            nextRemoveButton.focus();
          }
        }

        removeTag(tagName);
      }
    }
  }

  /**
   * Remove the tag from the set.
   * @param tagName Name of the tag to remove.
   */
  function removeTag(tagName: string) {
    uniqueTags.delete(tagName);
    tags = Array.from(uniqueTags);
  }

  /**
   * Add the tag to the set.
   * @param tagName Name of the tag to add.
   */
  function addTag(tagName: string) {
    uniqueTags.add(tagName);
    tags = Array.from(uniqueTags);
  }

  /**
   * Handle adding new tags to the list or removing them when backspace is pressed.
   *
   * Additional note: For some reason, mobile Chrome breaks the usual behaviour inside extension. `code` is becoming
   * empty, while usually it should contain proper button code.
   *
   * @param event
   */
  function handleKeyPresses(event: KeyboardEvent) {
    if ((event.code === 'Enter' || event.key === 'Enter') && addedTagName.length) {
      addTag(addedTagName)
      addedTagName = '';
    }

    if ((event.code === 'Backspace' || event.key === 'Backspace') && !addedTagName.length && tags?.length) {
      removeTag(tags[tags.length - 1]);
    }
  }
</script>

<div class="tags-editor">
  {#each uniqueTags.values() as tagName}
    <div class="tag">
      {tagName}
      <span class="remove" onclick={createTagRemoveHandler(tagName)}
            onkeydown={createTagRemoveHandler(tagName)}
            role="button" tabindex="0">x</span>
    </div>
  {/each}
  <input autocapitalize="none"
         autocomplete="off"
         bind:value={addedTagName}
         onkeydown={handleKeyPresses}
         type="text"/>
</div>

<style lang="scss">
  .tags-editor {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    input {
      width: 100%;
    }
  }
</style>
