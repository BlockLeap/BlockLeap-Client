import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import { sessionCookieValue } from "./profileLoader";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML(id) {
  return `<h2 class="text-center w-75 mx-auto pt-3" style="color: white;">${id[0].name}</h2>
  <h4 class="text-center w-75 mx-auto pt-3" style="color: white;">${id[0].description}</h4>
  <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
  <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2 w-75 mx-auto" id="display"></div>`;
}

function getRowHTML2(id) {
  return `
  <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">${id[0].name}</h2>
  <h4 class="text-center w-75 mx-auto pt-3" style="color: white;">${id[0].description}</h4>
   <div class="d-flex justify-content-center mt-3">
      <button id="addLevels" class="btn btn-success btn-lg">Add Levels</button>
    </div>
    <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2 w-75 mx-auto" id="display"></div>
   
  `;
}



/**
 *
 * @returns String of HTMLDivElement of a category placeholder
 */
function generateCategoryLevelsDivPlaceholder() {
  return `<div class="col placeholder-col">
              <div class="card mx-auto border-dark">
                  <div class="row g-0 text-dark">
                      <div class="placeholder bg-secondary col-md-3">
                      </div>
                      <div class="col-md-9">
                          <div class="card-body">
                            <div class="row row-cols-1 row-cols-md-2">
                                <div class="col">
                                    <h5 class="placeholder row card-title bg-secondary"></h5>
                                    <p class="placeholder row card-text bg-secondary"></p>
                                </div>
                                <div class="col align-self-center text-md-end">
                                    <h5>
                                        <span>
                                            <span class="placeholder col-1 bg-secondary"></span> <i class="placeholder bi bi-star-fill gold-star bg-secondary"></i>
                                            <span class="placeholder col-1 bg-secondary"></span> <i class="placeholder bi bi-play-fill bg-secondary"></i>
                                        </span>
                                    </h5>
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>`;
}

/**
 *
 * @param {Object} level with id, title, etc
 * @returns String of HTMLDivElement
 */
export async function generateLevelDiv(level) {
  if (!level || !level.statistics) {
    throw new Error("Invalid level data");
  }

  const { id, miniature, title, description = "Blockleap level" } = level;
  const { stars, attempts } = level.statistics;

  return `
    <div class="col">
      <div class="card mx-auto border-dark">
        <a class="getLevel" href="${API_ENDPOINT}/sets/level/${id}">
          <div class="row g-0 text-dark">
            <div class="col-md-3">
              ${
                miniature
                  ? `<img src="${miniature}" class="img-fluid rounded-start" alt="${title}">`
                  : ""
              }
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <div class="row row-cols-1 row-cols-md-2">
                  <div class="col">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${description}</p>
                  </div>
                  <div class="col align-self-center text-md-end">
                    <h5>
                      <span>
                        ${stars} <i class="bi bi-star-fill gold-star"></i>
                        ${attempts} <i class="bi bi-play-fill"></i>
                      </span>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>`;
}




export function AddLevelsMenu(levels, classLevels, setId) {
  // Eliminar dropdown existente si ya está en el DOM
  let existingDropdown = document.getElementById("dropdownMenu");
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // Convertir los niveles de la clase en un conjunto para búsqueda rápida
  const classLevelTitles = new Set(classLevels.map(level => level.title));

  // Separar los niveles en seleccionados y no seleccionados, incluyendo el id del nivel
  const selectedLevels = levels
    .filter(level => classLevelTitles.has(level.title))
    .map(level => ({
      ...level, // mantiene todas las propiedades del objeto
      classId: level.id // añade el id del nivel
    }));

  const unselectedLevels = levels
    .filter(level => !classLevelTitles.has(level.title))
    .map(level => ({
      ...level, // mantiene todas las propiedades del objeto
      classId: level.id // añade el id del nivel
    }));

  // Generar opciones dinámicamente para los niveles seleccionados
  let selectedOptionsHTML = selectedLevels
    .map(level => {
      return `
        <div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
          <input type="checkbox" checked id="${level.title}" />
          <label for="${level.title}" style="cursor: pointer;">${level.title}</label>
        </div>
      `;
    })
    .join("");

  // Generar opciones dinámicamente para los niveles no seleccionados
  let unselectedOptionsHTML = unselectedLevels
    .map(level => {
      return `
        <div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
          <input type="checkbox" id="${level.title}" />
          <label for="${level.title}" style="cursor: pointer;">${level.title}</label>
        </div>
      `;
    })
    .join("");

  // Crear el dropdown en HTML
  let dropdown = document.createElement("div");
  dropdown.id = "dropdownMenu";
  dropdown.className = "dropdown-menu show";
  dropdown.style.position = "fixed"; 
  dropdown.style.background = "white";
  dropdown.style.border = "1px solid gray";
  dropdown.style.padding = "15px";
  dropdown.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  dropdown.style.zIndex = "1000";
  dropdown.style.minWidth = "250px";
  dropdown.style.textAlign = "left";
  dropdown.style.borderRadius = "8px";

  // Agregar contenido al menú
  dropdown.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h4 style="margin: 0; font-size: 16px;">Select Levels</h4>
    <button id="closeMenuButton" style="border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
      x
    </button>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Selected Levels</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${selectedOptionsHTML}
    </div>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Non Selected Levels</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${unselectedOptionsHTML}
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 15px;">
    <button id="saveChangesButton" style="padding: 10px 20px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Save Changes
    </button>
  </div>
`;

  // Insertar el menú en el body
  document.body.appendChild(dropdown);

  // Centrar el menú en la pantalla
  dropdown.style.top = `50%`;
  dropdown.style.left = `50%`;
  dropdown.style.transform = "translate(-50%, -50%)"; // Centrarlo correctamente

  // Evento para cerrar el menú cuando se presiona el botón de cerrar
  document.getElementById("closeMenuButton")?.addEventListener("click", function () {
    dropdown.remove();
  });

  // Evento para obtener los niveles seleccionados y deseleccionados al hacer clic en "Guardar Cambios"
  document.getElementById("saveChangesButton")?.addEventListener("click", function () {
    
    handleSaveLevelChanges(levels, classLevelTitles, setId);
    dropdown.remove();
     });
}


async function handleSaveLevelChanges(levels, setLevelTitles,setId) {
  // Obtener todos los checkboxes marcados
  const selectedLevels = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
  .map(checkbox => checkbox.id); // Obtener el ID del checkbox (que es el título del nivel)

  // Filtrar para obtener solo los niveles completos (con el id) que no estaban seleccionados antes (niveles nuevos seleccionados)
  const newSelectedLevels = selectedLevels
  .map(title => levels.find(level => level.title === title)) // Encontrar el objeto completo
  .filter(level => level && !setLevelTitles.has(level.title)) // Filtrar los nuevos seleccionados
  .map(level => level.id); // Obtener solo el ID
  // Filtrar para obtener solo los niveles que estaban seleccionados anteriormente y ahora están desmarcados
  const deselectedLevels = Array.from(document.querySelectorAll("input[type='checkbox']:not(:checked)"))
  .map(checkbox => checkbox.id)
  .map(title => levels.find(level => level.title === title)) // Encontrar el objeto completo
  .filter(level => level && setLevelTitles.has(level.title)) // Filtrar los deseleccionados
  .map(level => level.id); // Obtener solo el ID
  

  if (newSelectedLevels.length > 0) {
  
    const postData = {
      levels: newSelectedLevels,
      id: setId,
    };

  await fetchRequest(
    `${API_ENDPOINT}/set/assignLevels/`,
    "POST",
    JSON.stringify(postData)
  );

  
  }

  if (deselectedLevels.length > 0) {
    const postData = {
      levels: deselectedLevels,
      id: setId,
    };

    await fetchRequest(
      `${API_ENDPOINT}/set/deleteLevels/`,
      "POST",
      JSON.stringify(postData)
    );
    
  }

  // Crear un mensaje de "Cambios Guardados"
  const successMessage = document.createElement("div");
  successMessage.textContent = "Changes saved successfully.!";
  successMessage.style.position = "fixed";
  successMessage.style.top = "20px";
  successMessage.style.left = "50%";
  successMessage.style.transform = "translateX(-50%)";
  successMessage.style.padding = "10px 20px";
  successMessage.style.backgroundColor = "green";
  successMessage.style.color = "white";
  successMessage.style.borderRadius = "5px";
  successMessage.style.fontSize = "16px";
  successMessage.style.zIndex = "1000";

  // Insertar el mensaje en el body
  document.body.appendChild(successMessage);

  setTimeout(() => {
  successMessage.remove();
  }, 3000);
}

async function generateMSG(message) {
  var msg=`<div class="container m-5">
      </div><div class="text-center text-muted bg-body p-2 rounded-5">
        <h1 class="text-body-emphasis">${message.msg}</h1>
        <p class="col-lg-6 mx-auto mb-4">
        ${message.desc}
        </p>`;
  if(message.buttonName){
    msg+=`</p><button class="btn btn-primary px-5 mb-5" type="button" id="${message.buttonName}">
    ${message.buttonMsg}
    </button>`
  }
  msg+=`</div>
    </div>`
  return msg
}


/**
 * Sets content and starts phaser LevelPlayer
 * @param {Event} event - click event of <a> to href with level id
 */
export async function playLevel(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.getLevel");
  const id = anchorTag.href.split("sets/level/")[1];
  history.pushState({ id }, "", `classLevel?id=${id}`);
  route();
}

export default async function loadSetById(id: string) {
  const cookie = sessionCookieValue();

    const set = await fetchRequest(
          `${API_ENDPOINT}/set/${id}`,
          "GET"
    );
    
  let role = "";
  if(cookie!=null){
    role = cookie.role;
  } 
    if(role=="Profesor"){
      document.getElementById("content").innerHTML = getRowHTML2(set);
    } else {
      document.getElementById("content").innerHTML = getRowHTML(set);
    }
  
  const divElement = document.getElementById("categories");



  try {
  

    const userLevels = await fetchRequest(
      `${API_ENDPOINT}/level/userLevels/${cookie.id}`,
      "GET"
    );
   
    const levels = await fetchRequest(
      `${API_ENDPOINT}/level/sets/${id}`,
      "GET"
    );

    if(levels!=null){

        // Load placeholders
       await fillContent(
        divElement,
        new Array(10),
        generateCategoryLevelsDivPlaceholder
        );
      let statistics = [];
     if (cookie !== null) {
      statistics = await fetchRequest(
        `${API_ENDPOINT}/play/categoryStatistics?category=${id}&user=${cookie.id}/`,
        "GET"
      );
    }
     const statisticsMap = statistics.reduce((map, statistic) => {
        map[statistic.level] = {
        stars: statistic.stars,
        attempts: statistic.attempts,
      };
      return map;
    }, {});

    const levelsWithStatistics = levels.map((level) => {
      const levelId = level.id;
      const statistic = statisticsMap[levelId];
      return {
        ...level,
        statistics: statistic || { stars: 0, attempts: 0 },
      };
    });

    await fillContent(divElement, levelsWithStatistics, generateLevelDiv);

    } else {
      var messages = [
        {
          msg: "There are no levels in the set yet",
          desc: "It looks like there are no levels in the set",
          buttonName: "",
          buttonMsg: ""
        }
      ];
      const textElement = document.getElementById("display");
      await fillContent(textElement, messages, generateMSG);
    }

    
    // Add getLevel event listener
    document.querySelectorAll("a.getLevel").forEach((level) => {
      level.addEventListener("click", playLevel);
    });
    document.getElementById("addLevels").addEventListener("click", (e: MouseEvent) => {
      AddLevelsMenu(userLevels,levels,id); 
    });
  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
}
