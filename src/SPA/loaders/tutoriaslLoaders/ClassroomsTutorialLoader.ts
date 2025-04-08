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
      <div class="container bg-body rounded-3 mt-3 pb-3">
          <h1 class="text-center w-75 mx-auto pt-3">Classrooms tutorial</h1>
        <p class="text-center w-75 mx-auto pt-3" >
          Once you enter the classroom tab, if you haven't signed in, you will need to do so in order to enjoy the benefits of being part of a class.<br><br>
          If you are already signed in, you will find a button at the top to join classes using a code. If you don’t have a code, contact your teacher and they will provide it for you.<br><br>
          Once you’ve joined one or more classes, select the one you want to enter.<br><br>
          Inside the class, at the top, you’ll find sets of levels that the teacher has created for the entire class. At the bottom, you’ll see individual levels that the teacher has selected as interesting for you to complete.
        </p>
      <div>
    `;
}


export default async function classroomsTutorialLoader() {
  history.pushState({}, "", "/tutorials/classrooms");
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
