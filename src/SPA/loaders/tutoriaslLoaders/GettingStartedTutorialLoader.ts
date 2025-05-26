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
        <div class="container text-center mt-5">
        <h1 class="text-white">🚀 Getting Started</h1>
        <p class="text-light mt-3">
            Start using BlockLeap in just a few steps. Follow the guide to set everything up quickly.
        </p>
    
    <div class="row mt-4">
        <div class="col-md-4">
            <div class="card bg-dark text-white p-3">
                <i class="bi bi-box-seam display-4"></i>
                <h4 class="mt-3">Step 1</h4>
                <p>Sign up and create your account clicking in the profile button in the right corner.</p>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card bg-dark text-white p-3">
                <i class="bi bi-gear display-4"></i>
                <h4 class="mt-3">Step 2</h4>
                <p>Start playing with the play button in the menu and explore the official levels</p>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card bg-dark text-white p-3">
                <i class="bi bi-rocket-takeoff display-4"></i>
                <h4 class="mt-3">Step 3</h4>
                <p> If you want to play and you dont know how, continue with the next tutorial!</p>
            </div>
        </div>
    </div>
</div>


       
    `;
}


export default async function GettingStarted() {
  history.pushState({}, "", "/tutorials/gettingstarted");
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
