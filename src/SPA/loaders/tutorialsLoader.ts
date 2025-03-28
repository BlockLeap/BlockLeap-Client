import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import GettingStarted  from "./tutoriaslLoaders/GettingStartedTutorialLoader";
import CreateLevelsLoader from "./tutoriaslLoaders/CreateLevelsTutorialLoader";
import HowtoPlay from "./tutoriaslLoaders/howToPlayTutorialLoader";
import classroomsTutorialLoader from "./tutoriaslLoaders/ClassroomsTutorialLoader"
import CommunityTutorial from "./tutoriaslLoaders/CommunityTutorialLoader";
import profileTutorial from "./tutoriaslLoaders/profileTutorialLoader";


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
                    <div class="card h-100 tutorial-card" id="gettingStarted">
                        <div class="card-body text-center">
                            <i class="bi bi-lightning-fill h1"></i>
                            <h5 class="card-title">Getting Started</h5>
                            <p class="card-text">Learn how to use the web</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 tutorial-card" id="createLevels">
                        <div class="card-body text-center">
                            <i class="bi bi-pencil-square h1"></i>
                            <h5 class="card-title">Create Levels Tutorial</h5>
                            <p class="card-text">Learn how to create levels.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 tutorial-card" id="howToPlay">
                        <div class="card-body text-center">
                            <i class="bi bi-controller h1"></i>
                            <h5 class="card-title">How to Play</h5>
                            <p class="card-text">Learn how to play BlockLeap</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 tutorial-card" id="Classrooms">
                        <div class="card-body text-center">
                            <i class="bi bi-book h1"></i>
                            <h5 class="card-title">Classrooms</h5>
                            <p class="card-text">Learn how to use see classrooms</p>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card h-100 tutorial-card" id="Community">
                        <div class="card-body text-center">
                            <i class="bi bi-people-fill h1"></i>
                            <h5 class="card-title">Community</h5>
                            <p class="card-text">Learn how to use the BlockLeap Community</p>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card h-100 tutorial-card" id="Profiletutorial">
                        <div class="card-body text-center">
                            <i class="bi bi-person-circle h1"></i>
                            <h5 class="card-title">Your Profile</h5>
                            <p class="card-text">Learn what you can make in your profile</p>
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
    document.getElementById("gettingStarted")?.addEventListener("click", (e) => {
        GettingStarted();
    });
    document.getElementById("createLevels")?.addEventListener("click", (e) => {
        CreateLevelsLoader();

    });
    document.getElementById("howToPlay")?.addEventListener("click", (e) => {
        HowtoPlay();
    });
    document.getElementById("Classrooms")?.addEventListener("click", (e) => {
        classroomsTutorialLoader();
    });
    document.getElementById("Community")?.addEventListener("click", (e) => {
        CommunityTutorial();
    });
    document.getElementById("Profiletutorial")?.addEventListener("click", (e) => {
        profileTutorial();
    });
    

  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    
}
