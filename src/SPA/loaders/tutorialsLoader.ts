import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import GettingStarted  from "./tutoriaslLoaders/GettingStartedLoader";
import CreateLevelsLoader from "./tutoriaslLoaders/CreateLevelsLoader";
import HowtoPlay from "./tutoriaslLoaders/howToPlayLoader";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML() {
    return `
  <h1 class="text-center w-75 mx-auto pt-3 mb-4" style="color: white; padding-bottom: 30px;">Tutorials</h1>


        <div class="container">
            <div class="row row-cols-1 row-cols-md-3 g-4">
                <div class="col">
                    <div class="card h-100 gettingStarted" id="gettingStarted">
                        <div class="card-body text-center">
                            <i class="bi bi-book h1"></i>
                            <h5 class="card-title">Getting Started</h5>
                            <p class="card-text">Learn how to use the web</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 tutorial-card" id="createLevels">
                        <div class="card-body text-center">
                            <i class="bi bi-laptop h1"></i>
                            <h5 class="card-title">Create Levels Tutorial</h5>
                            <p class="card-text">Learn how to create levels.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 tutorial-card" id="howToPlay">
                        <div class="card-body text-center">
                            <i class="bi bi-play-circle h1"></i>
                            <h5 class="card-title">How to Play</h5>
                            <p class="card-text">Learn how to play BlockLeap</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 gettingStarted" id="Classrooms">
                        <div class="card-body text-center">
                            <i class="bi bi-book h1"></i>
                            <h5 class="card-title">Classrooms</h5>
                            <p class="card-text">Learn how to use see classrooms</p>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card h-100 gettingStarted" id="gettingStarted">
                        <div class="card-body text-center">
                            <i class="bi bi-book h1"></i>
                            <h5 class="card-title">Getting Started</h5>
                            <p class="card-text">Learn how to use the web</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 gettingStarted" id="gettingStarted">
                        <div class="card-body text-center">
                            <i class="bi bi-book h1"></i>
                            <h5 class="card-title">Getting Started</h5>
                            <p class="card-text">Learn how to use the web</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export default async function loadTutorials() {
  document.getElementById("content").innerHTML = getRowHTML();
  const divElement = document.getElementById("categories");

  try {
    document.getElementById("createLevels")?.addEventListener("click", (e) => {
        CreateLevelsLoader();
    });
    document.getElementById("gettingStarted")?.addEventListener("click", (e) => {
        GettingStarted();
    });
    document.getElementById("howToPlay")?.addEventListener("click", (e) => {
        HowtoPlay();
    });
    

  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    
}
