import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import * as bootstrap from 'bootstrap';
import { appendLoginModal,sessionCookieValue } from "./profileLoader";
import { group } from "console";
const itemsPerPage=6;

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML(classId) {
  return `<h2 class="text-center w-75 mx-auto pt-3" style="color: white;">${classId[0].name}</h2>
          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">Grupos de ejercicios</h2>
          <p class="text-center w-75 mx-auto pt-2" style="color: white;">Dentro encontrarás ejercicios</p>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="sets"></div>
          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">PARA TI</h2>
          <p class="text-center w-75 mx-auto pt-2" style="color: white;">Niveles para esta clase</p>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
          <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2 w-75 mx-auto" id="display"></div>
           <div id="pageDiv" class="d-flex justify-content-center mt-3">
            <nav aria-label="pages">
              <ul class="pagination pagination-lg" id="paginationList">
              </ul>
            </nav>
          </div>
  `;
}
function getRowHTML2() {
  return `<div id="display"></div>
  `;
}

function getRowHTML3(classId){
  return `<h2 class="text-center w-75 mx-auto pt-3" style="color: white;">${classId[0].name} Profesor</h2>
          <div class="text-center w-100">
              <button id="addSets" class="btn btn-success btn-lg w-30">Add Sets</button>
              <button id="addLevels" class="btn btn-success btn-lg w-30">Add Levels</button>
              <button id="seeCode" class="btn btn-success btn-lg w-30">Class Code</button>
              <button id="students" class="btn btn-success btn-lg w-30">Students List</button>
          </div>

          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">Grupos de ejercicios</h2>
          <p class="text-center w-75 mx-auto pt-2" style="color: white;">Dentro encontrarás ejercicios</p>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="sets"></div>
          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">PARA TI</h2>
          <p class="text-center w-75 mx-auto pt-2" style="color: white;">Niveles para esta clase</p>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
          <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2 w-75 mx-auto" id="display"></div>
           <div id="pageDiv" class="d-flex justify-content-center mt-3">
            <nav aria-label="pages">
              <ul class="pagination pagination-lg" id="paginationList">
              </ul>
            </nav>
          </div>
            
  `;
}




/**
 *
 * @returns String of HTMLDivElement of a category placeholder
 */
function generateCommunityDivPlaceholder() {
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
async function generateLevelDiv(level) {
  if (!level || !level.statistics) {
    throw new Error("Invalid level data");
  }

  const { id, miniature, title, description = "Blockleap level" } = level;
  const { stars, attempts } = level.statistics;

  return `
    <div class="col">
      <div class="card mx-auto border-dark">
        <a class="getLevel" href="${API_ENDPOINT}/level/${id}">
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

/**
 *
 * @param {Object} set category with id, name, levels and description
 * @returns String of HTMLDivElement
 */

async function generateSetDiv(set) {
  return `<div class="col">
              <div class="card mx-auto border-dark d-flex flex-column h-100">
                <a class="set" href="set/${set.id}">
                    <h5 class="card-header card-title text-dark">
                      ${set.name}
                    </h5>
                    <div class="card-body text-dark">
                      ${set.description}
                    </div>
                </a>
              </div>
            </div>`;
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
  const id = anchorTag.href.split("level/")[1];
  history.pushState({ id }, "", `classLevel?id=${id}`);
  route();
}

export async function loadSet(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.set");
  const id = anchorTag.href.split("set/")[1];
  history.pushState({ id }, "", `set?id=${id}`);
  route();
}

/**
 * Sets content and starts phaser LevelPlayer
 * @param {Event} event - click event of <a> to href with level id
 */
export async function playSet(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.set");
  const id = anchorTag.href.split("level/")[1];
  history.pushState({ id }, "", `level?id=${id}`);
  route();
}

export function appendJoinGroupModal() {
  let joinGroupHtml = `
        <div id="joinGroupModal" class="modal fade" tabindex="-1" aria-labelledby="joinGroupLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="joinGroupLabel">Unirse a una clase</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="group" class="form-label">Clase</label>
                                <input type="text" class="form-control" id="group" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" id="joinReq">Unirse</button>
                        <span id="text-error-joinGroup"></span>
                    </div>
                </div>
            </div>
        </div>
    `;

  let joinGroup = document.createElement("div");
  joinGroup.innerHTML = joinGroupHtml;
  document.body.appendChild(joinGroup);

  let joinGroupModalElement = document.querySelector("#joinGroupModal");
  let joinGroupModalInstance = new bootstrap.Modal(joinGroupModalElement);

  joinGroupModalElement.addEventListener("hidden.bs.modal", function () {
    joinGroupModalElement.remove();
  });

  let joinBtn = document.getElementById("joinReq");
  if (joinBtn) {
    joinBtn.addEventListener("click", async function (event) {
      await useRegister(joinGroupModalInstance);
    });
  }

  joinGroupModalInstance.show();

}




export function StudentsMenu(students) {
    // Eliminar dropdown existente si ya está en el DOM

    console.log(students);
    let existingDropdown = document.getElementById("dropdownMenu");
    if (existingDropdown) {
      existingDropdown.remove();
    }

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


    const studentsHTML = students.map(student => `<div style="padding: 5px 0;">${student}</div>`).join("");

    dropdown.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h5 style="margin: 0; font-size: 16px;">Students</h5>
        <button id="closeMenuButton" style="border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
          x
        </button>
      </div>
      <hr>
      <div>
      
        <div style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column;">
          ${studentsHTML}
        </div>
      </div>
      <hr>
      <div style="display: flex; justify-content: center; margin-top: 15px;">
        <button id="studentslistButton" style="padding: 10px 20px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Perfecto
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
  document.getElementById("studentslistButton")?.addEventListener("click", function () {
    dropdown.remove();
  });


}


export function AddSetsMenu(sets,classSets,groupId,userLevels,user) {
  let existingDropdown = document.getElementById("dropdownMenu");
  if (existingDropdown) {
    existingDropdown.remove();
  }
    const setLevelTitles = new Set(classSets.map(set => set.name));

    const selectedSets = sets
    .filter(set => setLevelTitles.has(set. name))
    .map(set => ({
      ...set,
      classId: set.id 
    }));

  const unselectedSets = sets
    .filter(set => !setLevelTitles.has(set.name))
    .map(set => ({
      ...set, 
      classId: set.id 
    }));


     // Generar opciones dinámicamente para los niveles seleccionados
  let selectedOptionsHTML = selectedSets
  .map(set => {
    return `
      <div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
        <input type="checkbox" checked id="${set.name}" />
        <label for="${set.name}" style="cursor: pointer;">${set.name}</label>
      </div>
    `;
  })
  .join("");

// Generar opciones dinámicamente para los niveles no seleccionados
let unselectedOptionsHTML = unselectedSets
  .map(set => {
    return `
      <div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
        <input type="checkbox" id="${set.name}" />
        <label for="${set.name}" style="cursor: pointer;">${set.name}</label>
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
    <h4 style="margin: 0; font-size: 16px;">Selecciona Sets</h4>
    <button id="closeMenuButton" style="border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
      x
    </button>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Sets Seleccionados</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${selectedOptionsHTML}
    </div>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Sets No Seleccionados</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${unselectedOptionsHTML}
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 15px;">
    <button id="saveChangesButton" style="padding: 10px 20px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Save changes
    </button>
    <button id="createSetButton" style="padding: 10px 20px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Create Set
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
    handleSaveSetsChanges(sets, setLevelTitles,groupId);
    dropdown.remove();
     });

     document.getElementById("createSetButton")?.addEventListener("click", function () {
     createSet(userLevels, user);
      dropdown.remove();
    });
}

function createSet(userLevels: {id: string, title: string}[], user) {
  let createSetModalHtml = `
  <div id="createSetModal" class="modal fade" tabindex="-1" aria-labelledby="createSetModalLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                  <h5 class="modal-title" id="createSetModalLabel">Crear Set de Niveles</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  <form id="createSetForm">
                      <div class="mb-3">
                          <label for="setName" class="form-label">Nombre del Set</label>
                          <input type="text" class="form-control" id="setName" required>
                      </div>
                     <div>
                          <label for="setDescription" class="form-label">Descripción</label>
                          <textarea class="form-control" id="setDescription" rows="3" required></textarea>
                      </div>
                      <div class="mb-3">
                          <label for="setLevels" class="form-label">Añadir Niveles</label>
                          <div id="setLevels" class="form-check">
                              <!-- Los niveles se llenarán dinámicamente con checkboxes -->
                              ${userLevels.map(level => `
                                <div class="form-check">
                                  <input class="form-check-input" type="checkbox" value="${level.id}" id="level-${level.id}">
                                  <label class="form-check-label" for="level-${level.id}">
                                    ${level.title}
                                  </label>
                                </div>
                              `).join('')}
                          </div>
                      </div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary" id="saveSetBtn">Guardar Set</button>
              </div>
          </div>
      </div>
  </div>`;

  let createSetModal = document.createElement("div");
  createSetModal.innerHTML = createSetModalHtml;
  document.body.appendChild(createSetModal);

  let createSetModalElement = document.querySelector("#createSetModal");
  let createSetModalInstance = new bootstrap.Modal(createSetModalElement);

  createSetModalElement.addEventListener("hidden.bs.modal", function () {
      createSetModalElement.remove();
  });

  createSetModalInstance.show();

  document.getElementById("saveSetBtn")?.addEventListener("click", async function (event) {
      event.preventDefault();
      let setName = (document.getElementById("setName") as HTMLInputElement).value.trim();
      let setDescription = (document.getElementById("setDescription") as HTMLTextAreaElement).value.trim();
      
      // Obtener los niveles seleccionados (IDs de los checkboxes marcados)
      const selectedLevels = Array.from((document.getElementById("setLevels") as HTMLDivElement).querySelectorAll('input[type="checkbox"]:checked'))
                                  .map((checkbox: HTMLInputElement) => checkbox.value);

      if (setName === "" || setDescription === "") {
          alert("Por favor, completa todos los campos.");
          return;
      }

      let postData = {
          name: setName,
          description: setDescription,
          levels: selectedLevels,
          user:user
      };

      try {
           await fetchRequest(
              `${API_ENDPOINT}/set/create/`,
              "POST",
              JSON.stringify(postData)
            );
          createSetModalInstance.hide();
          
  // Crear un mensaje de "Cambios Guardados"
  const successMessage = document.createElement("div");
  successMessage.textContent = "Cambios guardados correctamente!";
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
      } catch (error) {
          console.error('Error al crear el set de niveles:', error);
          alert("Hubo un error al crear el set de niveles.");
      }
  });
}


async function handleSaveSetsChanges(sets, setLevelTitles,groupId) {
  // Obtener todos los checkboxes marcados

  const selectedSets = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
  .map(checkbox => checkbox.id); // Obtener el ID del checkbox (que es el título del nivel)

  
  const newSelectedSets = sets.filter(set => 
    selectedSets.includes(set.name) && !setLevelTitles.has(set.name)
  );

const deselectedSets = sets.filter(set =>
  !selectedSets.includes(set.name) && setLevelTitles.has(set.name)
);


  if (newSelectedSets.length > 0) {
  
    const postData = {
      sets: newSelectedSets.map(set => set.id), 
      id: groupId.map(group=>group.id), 
    };
   

  await fetchRequest(
    `${API_ENDPOINT}/group/addSet`,
    "POST",
    JSON.stringify(postData)
  );

  }

  if (deselectedSets.length > 0) {
    const postData = {
      sets: deselectedSets.map(set => set.id), 
      id: groupId.map(group=>group.id), 
    };

    await fetchRequest(
      `${API_ENDPOINT}/group/deleteSet`,
      "POST",
      JSON.stringify(postData)
    );
    
  }

  // Crear un mensaje de "Cambios Guardados"
  const successMessage = document.createElement("div");
  successMessage.textContent = "Cambios guardados correctamente!";
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

export function AddLevelsMenu(levels, classLevels, groupId) {
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
    <h4 style="margin: 0; font-size: 16px;">Selecciona Niveles</h4>
    <button id="closeMenuButton" style="border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
      x
    </button>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Niveles Seleccionados</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${selectedOptionsHTML}
    </div>
  </div>
  <hr>
  <div>
    <h5 style="margin-top: 0;">Niveles No Seleccionados</h5>
    <div style="max-height: 200px; overflow-y: auto;">
      ${unselectedOptionsHTML}
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 15px;">
    <button id="saveChangesButton" style="padding: 10px 20px; background-color: green; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Guardar Cambios
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
    handleSaveLevelChanges(levels, classLevelTitles,groupId);
    dropdown.remove();
     });
}


async function handleSaveLevelChanges(levels, classLevelTitles,groupId) {
  // Obtener todos los checkboxes marcados
  const selectedLevels = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
  .map(checkbox => checkbox.id); // Obtener el ID del checkbox (que es el título del nivel)

  // Filtrar para obtener solo los niveles completos (con el id) que no estaban seleccionados antes (niveles nuevos seleccionados)
  const newSelectedLevels = selectedLevels
  .map(title => levels.find(level => level.title === title)) // Encontrar el objeto completo
  .filter(level => level && !classLevelTitles.has(level.title)); // Filtrar los nuevos seleccionados

  // Filtrar para obtener solo los niveles que estaban seleccionados anteriormente y ahora están desmarcados
  const deselectedLevels = Array.from(document.querySelectorAll("input[type='checkbox']:not(:checked)"))
  .map(checkbox => checkbox.id)
  .map(title => levels.find(level => level.title === title)) // Encontrar el objeto completo
  .filter(level => level && classLevelTitles.has(level.title)); // Filtrar los deseleccionados
  

  if (newSelectedLevels.length > 0) {
  
    const postData = {
      levels: newSelectedLevels,
      id: groupId,
    };

  await fetchRequest(
    `${API_ENDPOINT}/group/addLevel`,
    "POST",
    JSON.stringify(postData)
  );
  }

  if (deselectedLevels.length > 0) {
    const postData = {
      levels: deselectedLevels,
      id: groupId,
    };
    await fetchRequest(
      `${API_ENDPOINT}/group/deleteLevel`,
      "POST",
      JSON.stringify(postData)
    );
  }

  // Crear un mensaje de "Cambios Guardados"
  const successMessage = document.createElement("div");
  successMessage.textContent = "Cambios guardados correctamente!";
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

export function appendSeeCodeModal(code, classId) {
  // Aquí creamos el HTML del modal con los valores dinámicos
  let joinGroupHtml = `
   <div id="seeCodeModal" class="modal fade" tabindex="-1" aria-labelledby="joinGroupLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="joinGroupLabel">${classId[0].name} Code</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <div class="form-control bg-light border rounded p-2" id="classCode">${code}</div>
                                <button class="btn btn-outline-secondary" type="button" id="copyCodeBtn">Copiar</button>
                                <div id="messageContainer"></div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
  `;

  let seeCode = document.createElement("div");
  seeCode.innerHTML = joinGroupHtml;
  document.body.appendChild(seeCode);


  let seeCodeModalElement = document.querySelector("#seeCodeModal") as HTMLElement;
  let seeCodeModalInstance = new bootstrap.Modal(seeCodeModalElement);

  
  seeCodeModalElement.addEventListener("hidden.bs.modal", function () {
    seeCodeModalElement.remove();
  });

  // Muestra el modal
  seeCodeModalInstance.show();

 // Copiar al portapapeles cuando se haga clic en el botón
 const copyCodeBtn = document.getElementById("copyCodeBtn") as HTMLButtonElement;
 const classCodeInput = document.getElementById("classCode") as HTMLInputElement;

 copyCodeBtn.addEventListener("click", () => {
  
  navigator.clipboard.writeText(classCodeInput.value)
    .then(() => {
      
      let message = document.createElement('p'); 
      message.textContent = "Código copiado al portapapeles!";
      message.style.color = "green"; 
      message.style.marginTop = "10px"; 
      
      document.getElementById("messageContainer").innerHTML = '';
      document.getElementById("messageContainer").appendChild(message);
    })
    .catch(err => {
      console.error("Error al copiar al portapapeles: ", err);
    });
});

}



async function useRegister(modal : bootstrap.Modal):Promise<any> {
  const groupCode = (document.getElementById("group") as HTMLInputElement)
    .value;
  const cookie = sessionCookieValue();
  const userId= cookie.id;
  ;
  const postData = {
    groupCode: groupCode,
    userId:userId
  };
  try{
    await fetchRequest(
      `${API_ENDPOINT}/group/register`,
      "POST",
      JSON.stringify(postData)
    );
    modal.hide();
    window.location.reload();
  }
  catch(error) {
    console.error('Error general:', error);
  }
}

async function loadPagination(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.getPage");   
  const ruta = anchorTag.href.split("level/class/")[1];
  const id=ruta.split("/page/")[0];
  const page=ruta.split("/page/")[1];

  history.pushState({page}, "", `class?page=${page}`);
  loadLevels(id,page);

}

async function loadLevels(id,page){
  
  const divElement = document.getElementById("categories");
  const res = await fetchRequest(
    `${API_ENDPOINT}/level/class/${id}/page/${page}`,
    "GET"
  );
    const levels=res.levels;
    const levelCount=res.count;
    const levelsWithStatistics = await loadLevelStats(levels);
    let totalPages=(levelCount/itemsPerPage);if((levelCount%itemsPerPage)!=0)totalPages++;
    await fillContent(divElement, levelsWithStatistics, generateLevelDiv);
    loadPageNav(id,totalPages,page);
    // Add getLevel event listener
    document.querySelectorAll("a.getLevel").forEach((level) => {
      level.addEventListener("click", playLevel);
    });
    document.querySelectorAll("a.getPage").forEach((page) => {
      page.addEventListener("click", loadPagination);
    });
}

async function loadLevelStats(levels){
  const cookie = sessionCookieValue();

  let statistics = [];
  if (cookie !== null) {
    statistics = await fetchRequest(
      `${API_ENDPOINT}/play/communityStatistics?user=${cookie.id}/`,
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
  return levelsWithStatistics;
}

async function loadPageNav(classId,pages,currentPage){

  const list= document.getElementById("paginationList");
  let items='';
  for(let i=1; i<=pages;i++){
    if(i==currentPage)
      items+=`<li class="page-item"><a class="page-link active getPage" href="${API_ENDPOINT}/level/class/${classId}/page/${i}">${i}</a></li>`
    else
      items+=`<li class="page-item"><a class="page-link getPage" href="${API_ENDPOINT}/level/class/${classId}/page/${i}">${i}</a></li>`
  }
  list.innerHTML=items;

  
}

export async function loadClassProfesor(id,page='1') {

  const classId = await fetchRequest(
    `${API_ENDPOINT}/group/${id}`, 
    "GET"
  );
  
  const classCode = await fetchRequest(
    `${API_ENDPOINT}/group/findByCode/${id}`, 
    "GET"
  );
 
  
  const idsStudents = await fetchRequest(
    `${API_ENDPOINT}/group/students/${id}`, 
    "GET"
  );

  
  const userIds = idsStudents.map(student => student.user);

  const studentsNames = await fetchRequest(
    `${API_ENDPOINT}/user/names/${userIds}`,
    "GET"
  );


  document.getElementById("content").innerHTML = getRowHTML3(classId);
  const divElement = document.getElementById("categories");
 
  // Load placeholders
  await fillContent(divElement, new Array(10), generateCommunityDivPlaceholder);

  try {
    const cookie = sessionCookieValue();
    if((cookie !== null)){

   

      const res = await fetchRequest(
        `${API_ENDPOINT}/level/class/${id}/page/${page}`,
        "GET"
      );
      const levels=res.levels;
      const levelCount=res.count;
      const sets = await fetchRequest(
        `${API_ENDPOINT}/level/class/${id}/sets`,
        "GET"
      );

      const userLevels = await fetchRequest(
        `${API_ENDPOINT}/level/userLevels/${cookie.id}`,
        "GET"
      );
      
      const userSets = await fetchRequest(
        `${API_ENDPOINT}/set/userSets/${cookie.id}`,
        "GET"
      );

      if(levels!=null || sets!=null){
        if(levels.length!=0 || sets.length!=0){
          if(levels.length!=0){
            let statistics = [];
            statistics = await fetchRequest(
              `${API_ENDPOINT}/play/communityStatistics?user=${cookie.id}/`,
              "GET"
            );
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
 

            /*
            let totalPages=(levels.length/itemsPerPage);if((levels.length%itemsPerPage)!=0)totalPages++;
            loadPageNav(totalPages,page);
            
            document.querySelectorAll("a.getPage").forEach((page) => {
              page.addEventListener("click", loadPagination);
            });
            */
            let totalPages=(levelCount/itemsPerPage);if((levelCount%itemsPerPage)!=0)totalPages++;
            // Add getLevel event listener
            loadPageNav(id,totalPages,page);
            // Add getLevel event listener
            document.querySelectorAll("a.getLevel").forEach((level) => {
              level.addEventListener("click", playLevel);
            });
            document.querySelectorAll("a.getPage").forEach((page) => {
              page.addEventListener("click", loadPagination);
            });
          } else{
            document.getElementById("content").innerHTML = getRowHTML3(classId);
            var messages=[{msg:"Aun no hay niveles en la clase",desc:"Parece que no hay niveles en la clase, Añade niveles",buttonName:"",buttonMsg:""}];
            const textElement = document.getElementById("display");
            await fillContent(textElement, messages, generateMSG);
          }
          if(sets.length!=0){
            const setDiv = document.getElementById("sets");
            await fillContent(setDiv, sets, generateSetDiv);
            document.querySelectorAll("a.set").forEach((set) => {
              set.addEventListener("click", loadSet);
            });
          }

          
          document.getElementById("addSets").addEventListener("click", (e: MouseEvent) => {
            AddSetsMenu(userSets,sets,classId,userLevels,cookie.id); 
          });
    
          document.getElementById("addLevels").addEventListener("click", (e: MouseEvent) => {
             AddLevelsMenu(userLevels,levels,classId); 
          });
          document.getElementById("seeCode").addEventListener("click", (e: MouseEvent) => {
             appendSeeCodeModal(classCode.code,classId);
          });
          document.getElementById("students").addEventListener("click", (e: MouseEvent) => {
             StudentsMenu(studentsNames); 
         });
        }else{//No hay niveles en el grupo
          
            document.getElementById("content").innerHTML = getRowHTML3(classId);
            var messages=[{msg:"Aun no hay niveles en la clase",desc:"Parece que no hay niveles en la clase, Añade niveles",buttonName:"",buttonMsg:""}];
            const textElement = document.getElementById("display");
            await fillContent(textElement, messages, generateMSG);
            document.getElementById("addSets").addEventListener("click", (e: MouseEvent) => {
              //AddSetsMenu(userSets,userSets,classId); 
            });
      
            document.getElementById("addLevels").addEventListener("click", (e: MouseEvent) => {
               AddLevelsMenu(userLevels,levels,classId); 
            });
            document.getElementById("seeCode").addEventListener("click", (e: MouseEvent) => {
               appendSeeCodeModal(classCode.code,classId);
            });
        }
      }else{//Sin grupo
        document.getElementById("content").innerHTML = getRowHTML2();
        var messages=[{msg:"No perteneces a ninguna clase",desc:"Unete a una clase para acceder a sus niveles",buttonName:"joinGroup",buttonMsg:"Unirse a una clase"}];
        const textElement = document.getElementById("display");
  
        await fillContent(textElement, messages, generateMSG);
        document.getElementById("joinGroup").addEventListener("click", (e: MouseEvent) => {
          appendJoinGroupModal();
        });
      }
    }else{//Sin sesión
      document.getElementById("content").innerHTML = getRowHTML2();
      var messages=[{msg:"No hay sesión iniciada",desc:"Inicia sesión para acceder a tu clase",buttonName:"altLogin",buttonMsg:"Iniciar Sesión"}];
      const textElement = document.getElementById("display");

      await fillContent(textElement, messages, generateMSG);
      document.getElementById("altLogin").addEventListener("click", (e: MouseEvent) => {
            appendLoginModal();
      });
    }
  } catch(error) { 
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }



  
}

export default async function loadClass(id,page = '1') {
  const classId = await fetchRequest(
    `${API_ENDPOINT}/group/${id}`, 
    "GET"
  );

  document.getElementById("content").innerHTML = getRowHTML(classId);
  const divElement = document.getElementById("categories");
  
  // Load placeholders
  await fillContent(divElement, new Array(10), generateCommunityDivPlaceholder);

  try {
    const cookie = sessionCookieValue();
    if((cookie !== null)){
      const res = await fetchRequest(
        `${API_ENDPOINT}/level/class/${id}/page/${page}`,
        "GET"
      );
      const levels=res.levels;
      const levelCount=res.count;
      const sets = await fetchRequest(
        `${API_ENDPOINT}/level/class/${id}/sets`,
        "GET"
      );
      if(levels!=null || sets!=null){
        if(levels.length!=0 || sets.length!=0){
          if(levels.length!=0){
            let statistics = [];
            statistics = await fetchRequest(
              `${API_ENDPOINT}/play/communityStatistics?user=${cookie.id}/`,
              "GET"
            );
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
            let totalPages=(levelCount/itemsPerPage);if((levelCount%itemsPerPage)!=0)totalPages++;
            loadPageNav(id,totalPages,page);
            // Add getLevel event listener
            document.querySelectorAll("a.getLevel").forEach((level) => {
              level.addEventListener("click", playLevel);
            });
            document.querySelectorAll("a.getPage").forEach((page) => {
              page.addEventListener("click", loadPagination);
            });
          } else{
            document.getElementById("content").innerHTML = getRowHTML3(classId);
            var messages=[{msg:"Aun no hay niveles en la clase",desc:"Parece que no hay niveles en la clase, Añade niveles",buttonName:"",buttonMsg:""}];
            const textElement = document.getElementById("display");
            await fillContent(textElement, messages, generateMSG);
          }
          if(sets.length!=0){
          
            const setDiv = document.getElementById("sets");
            await fillContent(setDiv, sets, generateSetDiv);
            document.querySelectorAll("a.set").forEach((set) => {
              set.addEventListener("click", loadSet);
            });
          }else{
            document.getElementById("content").innerHTML = getRowHTML3(classId);
            var messages=[{msg:"Aun no hay Sets en la clase",desc:"Parece que no hay sets en la clase, espera a que tu profesor añada niveles",buttonName:"",buttonMsg:""}];
            const textElement = document.getElementById("display");
            await fillContent(textElement, messages, generateMSG);
          }
        } else{//No hay niveles en el grupo
          document.getElementById("content").innerHTML = getRowHTML2();
          var messages=[{msg:"Aun no hay niveles en la clase",desc:"Parece que no hay niveles en la clase, espera a que tu profesor añada niveles",buttonName:"",buttonMsg:""}];
          const textElement = document.getElementById("display");
          await fillContent(textElement, messages, generateMSG);

        }
      }else{//Sin grupo
        document.getElementById("content").innerHTML = getRowHTML2();
        var messages=[{msg:"No perteneces a ninguna clase",desc:"Unete a una clase para acceder a sus niveles",buttonName:"joinGroup",buttonMsg:"Unirse a una clase"}];
        const textElement = document.getElementById("display");
  
        await fillContent(textElement, messages, generateMSG);
        document.getElementById("joinGroup").addEventListener("click", (e: MouseEvent) => {
          appendJoinGroupModal();
        });
      }
    }else{//Sin sesión
      document.getElementById("content").innerHTML = getRowHTML2();
      var messages=[{msg:"No hay sesión iniciada",desc:"Inicia sesión para acceder a tu clase",buttonName:"altLogin",buttonMsg:"Iniciar Sesión"}];
      const textElement = document.getElementById("display");

      await fillContent(textElement, messages, generateMSG);
      document.getElementById("altLogin").addEventListener("click", (e: MouseEvent) => {
            appendLoginModal();
      });
    }
  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
}
