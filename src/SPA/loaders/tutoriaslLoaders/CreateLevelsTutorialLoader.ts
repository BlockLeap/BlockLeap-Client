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
        <h1 class="text-center w-75 mx-auto p-3 bg-dark rounded-3" style="color: white;">Create Levels</h1>
        <div class="container bg-dark rounded-3 mt-3 pb-3">
        <h3 class="text-center w-75 mx-auto pt-3" style="color: white;">Create Board</h3>
        <p class="text-center w-75 mx-auto pt-3" style="color: white;">In the game interface the first thing you will find is the board you have to build where 
        you have to set the number of rows and columns that your level will have. Once you have set 
        the rows and columns you will have to paint the board with the basic elements, floor, 
        walls and corners. On the floor you can add the dynamic elements, such as the character, 
        the chest, the traps and the ladder. To be able to save the level it is essential that you put 
        the character and the escape ladder. After that you can press <strong>save!</strong></p>

        <img src="/images/board_example.png" alt="Board Example" class="mx-auto d-block" style="width: 50%; margin-top: 15px;">
        </div>
        <div class="container bg-dark rounded-3 mt-3 pb-3">
        <h3 class="text-center w-75 mx-auto pt-3" style="color: white;">Level Settings</h3>
        <p class="text-center w-75 mx-auto pt-3" style="color: white;">    
        When you click on save you will see the screen where you can configure the level.  
        In the upper right corner you can configure the blocks that the user can use to pass the level.
        You can save the level for later or if you pass it with the blocks you can save it and publish it in the 
        community. You will not be able to publish levels in the community that have not been completed.
        When you pass the level you will see a screen to save the level with its name, description and you 
        can add tags to the level and decide whether to publish it in the community or not.
        </p>
       <img src="/images/BlockLimits.png" alt="Block Limits" class="d-block" style="width: 20%; margin-top: 15px; float: left;">
       <img src="/images/SaveLevel.png" alt="Save Level" class="d-block" style="width: 20%; margin-top: 15px; float: center;">
       <img src="/images/publish.png" alt="Publish Level" class="d-block" style="width: 20%; margin-top: 15px; float: right;">
       </div>
       </div>

    `;
}

export default async function CreateLevelsLoader() {
  history.pushState({}, "", "/tutorials/createlevel");
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
