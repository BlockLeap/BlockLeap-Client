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
        <div class="container bg-dark-subtle rounded-3 mt-3 pb-3">
        <h1 class="text-center w-75 mx-auto pt-3" ">Profile tutorial</h1>
        <p class="text-center w-75 mx-auto pt-3"">
        In the user's profile, at the top, we’ll see information related to ourselves and our progress in the game, such as completed levels and stars earned.
At the bottom, all the levels the user has created in the game editor will be displayed, allowing quick and organized access to them.
        </p>
        </div>
        
       
    `;
}

export default async function profileTutorial() {
  history.pushState({}, "", "/tutorials/profile");
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
