import type { Reroute } from "@sveltejs/kit";

export const reroute: Reroute = ({url}) => {
  // Reroute index.html as just / for the root.
  // Browser extension starts from with the index.html file in the pathname which is not correct for the router.
  if (url.pathname === '/index.html') {
    if (url.searchParams.has('path')) {
      return url.searchParams.get('path')!;
    }

    return "/";
  }
};
