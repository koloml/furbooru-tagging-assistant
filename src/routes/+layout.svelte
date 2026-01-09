<script lang="ts">
  import "../styles/popup.scss";
  import Header from "$components/layout/Header.svelte";
  import Footer from "$components/layout/Footer.svelte";
  import { initializeLinksReplacement } from "$lib/popup-links";
  import { onDestroy } from "svelte";
  import { headTitle } from "$stores/popup";

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // Sort of a hack, detect if we rendered in the browser tab or in the popup.
  // Popup will always should have fixed 320px size, otherwise we consider it opened in the tab.
  document.body.classList.toggle('is-in-tab', window.innerWidth > 320);

  const disconnectLinkReplacement = initializeLinksReplacement();

  onDestroy(() => {
    disconnectLinkReplacement();
  })
</script>

<svelte:head>
  <title>{$headTitle}</title>
</svelte:head>

<Header/>
<main>
  {@render children?.()}
</main>
<Footer/>

<style global lang="scss">
  main {
    padding: .5em 24px;
  }
</style>
