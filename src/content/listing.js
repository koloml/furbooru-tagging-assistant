import {createMaintenancePopup} from "$lib/components/MaintenancePopup.js";
import {createMediaBoxTools} from "$lib/components/MediaBoxTools.js";
import {calculateMediaBoxesPositions, initializeMediaBox} from "$lib/components/MediaBoxWrapper.js";
import {createMaintenanceStatusIcon} from "$lib/components/MaintenanceStatusIcon.js";
import {createImageShowFullscreenButton} from "$lib/components/ImageShowFullscreenButton.js";

/** @type {NodeListOf<HTMLElement>} */
const mediaBoxes = document.querySelectorAll('.media-box');

mediaBoxes.forEach(mediaBoxElement => {
  initializeMediaBox(mediaBoxElement, [
    createMediaBoxTools(
      createMaintenancePopup(),
      createMaintenanceStatusIcon(),
      createImageShowFullscreenButton(),
    )
  ]);

  // Attempt to fix misplacement of media boxes
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('resize'));
  })
});

calculateMediaBoxesPositions(mediaBoxes);
