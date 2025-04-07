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
        <h1 class="text-center w-75 mx-auto pt-3" style="color: white;">Community tutorial</h1>
        <p class="text-center w-75 mx-auto pt-3" style="color: white;">
        In the community section, we will share the levels we choose to and view those shared by users from all around the world.  
          At the top, you’ll find a filtering bar with tags to help you find levels associated with them.  
          Below this bar, you’ll see all the levels published by users in the community. If you’ve applied any filters, only the levels that match them will be displayed.
        </p>
    `;
}


export default async function CommunityTutorial() {
  history.pushState({}, "", "/tutorials/community");
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
