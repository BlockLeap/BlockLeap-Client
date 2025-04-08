import { route } from "../../../client";
import config from "../../../Game/config.js";
import { fetchRequest, fillContent } from "../../utils";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML() {
    return `
        <div class="container bg-body rounded-3 mt-3 p-3">
        <h1 class="text-center w-75 mx-auto bg-secondary rounded-3 p-3" style="color: white;">How to play</h1>
        <div class="container bg-secondary rounded-3 mt-3 pb-3">
        <p class="text-center w-75 mx-auto pt-3" style="color: white;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vehicula semper nibh quis tincidunt. 
        Integer vel molestie justo, in dictum nunc. Suspendisse dapibus volutpat lacus. Nunc cursus commodo libero, 
        a molestie eros dictum vel. Duis porta magna sed fringilla imperdiet. Morbi ornare lacus ante. Sed commodo maximus elit, 
        nec auctor nisl iaculis vel. Nulla sed pretium urna, sed varius justo. Mauris facilisis euismod hendrerit. Maecenas pretium, ex vitae porttitor ullamcorper, 
        nisl tellus ultrices ipsum, feugiat laoreet sem massa ac metus. Integer pulvinar commodo varius. Donec et cursus arcu. 
        Suspendisse lacinia sem sit amet elementum luctus. Pellentesque in lorem at urna blandit molestie. Curabitur non suscipit leo. Quisque tristique posuere dolor, vel vehicula arcu sodales at.</p>
        </div>
        </div>
    `;
}


export default async function HowtoPlay() {
  history.pushState({}, "", "/tutorials/howtoplay");
  document.getElementById("content").innerHTML = getRowHTML();
  const divElement = document.getElementById("categories");

  try {


  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    
}
