import { createMaintenancePopup } from "$content/components/MaintenancePopup";
import { createMediaBoxTools } from "$content/components/MediaBoxTools";
import { calculateMediaBoxesPositions, initializeMediaBox } from "$content/components/MediaBoxWrapper";
import { createMaintenanceStatusIcon } from "$content/components/MaintenanceStatusIcon";
import { createImageShowFullscreenButton } from "$content/components/ImageShowFullscreenButton";
import { initializeImageListContainer } from "$content/components/listing/ImageListContainer";

const mediaBoxes = document.querySelectorAll<HTMLElement>('.media-box');
const imageListContainer = document.querySelector<HTMLElement>('#imagelist-container');

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

if (imageListContainer) {
  initializeImageListContainer(imageListContainer);
}
