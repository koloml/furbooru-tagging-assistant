import { initializeSiteHeader } from "$lib/components/SiteHeaderWrapper";

const siteHeader = document.querySelector<HTMLElement>('.header');

if (siteHeader) {
  initializeSiteHeader(siteHeader);
}
