import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import * as bootstrap from 'bootstrap';
import { appendLoginModal,sessionCookieValue } from "./profileLoader";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */

function getRowHTML3() {
  return `<div id="display"></div>
  `;
}

function getRowHTML2() {
  return `<h2 class="text-center w-75 mx-auto pt-3" style="color: white;">CLASSES</h2>
          <div class="text-center w-100">
              <button id="join" class="btn btn-success btn-lg w-30">Join new class</button>
          </div>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="display"></div>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="joinButton">
            
          </div>
  `;
}
function getRowHTML() {
  return `<h2 class="text-center w-75 mx-auto pt-3" style="color: white;">CLASSES</h2>
          <div class="text-center w-100">
            <button id="create" class="btn btn-success btn-lg w-30">Create new class</button>
            <button id="join" class="btn btn-success btn-lg w-30">Join new class</button>
          </div>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="display"></div>
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="joinButton">

          </div>
  `;
}

/**
 *
 * @param {Event} event
 * Gets levels of a category from DB and shows them on screen
 */
async function loadClassLevels(event) {
  event.preventDefault();

  const anchorTag = event.target.closest("a.class");

  const id = anchorTag.href.split("class/")[1];
  history.pushState({ id }, "", `class?id=${id}`);

  route();
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

export function appendCreateGroupModal() {
  let createGroupHtml = `
  <div id="createGroupModal" class="modal fade" tabindex="-1" aria-labelledby="createGroupLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header bg-primary text-white">
<<<<<<< HEAD
                  <h5 class="modal-title" id="createGroupLabel">Create a new class</h5>
=======
                  <h5 class="modal-title" id="createGroupLabel">Crear a una clase</h5>
>>>>>>> English-Version
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  <form>
                      <div class="mb-3">
                          <label for="group" class="form-label">Class</label>
                          <input type="text" class="form-control" id="group" required>
                      </div>
                      <div class="mb-3">
                          <label for="group" class="form-label">Description</label>
                          <input type="text" class="form-control" id="description" required>
                      </div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" id="createReq">Create</button>
                  <span id="text-error-joinGroup"></span>
              </div>
          </div>
      </div>
  </div>
`;

let createGroup = document.createElement("div");
createGroup.innerHTML = createGroupHtml;
  document.body.appendChild(createGroup);

  let createGroupModalElement = document.querySelector("#createGroupModal");
  let createGroupModalInstance = new bootstrap.Modal(createGroupModalElement);

  createGroupModalElement.addEventListener("hidden.bs.modal", function () {
    createGroupModalElement.remove();
  });

  let joinBtn = document.getElementById("createReq");
  if (joinBtn) {
    joinBtn.addEventListener("click", async function (event) {
      await createRegister(createGroupModalInstance);

      const successMessage = document.createElement("div");
      successMessage.textContent = "Clase creada!";
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
    });
  }

  createGroupModalInstance.show();

}

async function createRegister(modal : bootstrap.Modal):Promise<any> {
  const groupName = (document.getElementById("group") as HTMLInputElement)
    .value;
    const description = (document.getElementById("description") as HTMLInputElement)
    .value;
  const cookie = sessionCookieValue();
  const userId= cookie.id;
  ;
  const postData = {
    groupName: groupName,
    description:description,
    userId:userId
  };
  try{
    
    await fetchRequest(
      `${API_ENDPOINT}/group/create`,
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

export function appendJoinGroupModal() {
  let joinGroupHtml = `
        <div id="joinGroupModal" class="modal fade" tabindex="-1" aria-labelledby="joinGroupLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="joinGroupLabel">Join a new class</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="group" class="form-label">Enter code</label>
                                <input type="text" class="form-control" id="group" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" id="joinReq">Join</button>
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

      const successMessage = document.createElement("div");
      successMessage.textContent = "Te has unido a la clase correctamente!";
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

    });
  }

  joinGroupModalInstance.show();

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

//Toca implementar para SPA en vez de enrutar directamente
async function loadClass() {//TODO ejemplos en otros loaders

}
export async function loadWaitingRoomProfesor() {
  document.getElementById("content").innerHTML = getRowHTML();
  const textElement = document.getElementById("display");
  
  try {
    const cookie = sessionCookieValue();
    
    
    if(cookie !== null){
      const classes = await fetchRequest(
        `${API_ENDPOINT}/group/findByUser/${cookie.id}`,
        "GET"
      );
      
      if(classes.length){

        const group = await fetchRequest(
          `${API_ENDPOINT}/group/${classes.map(a => a.group)}`,
          "GET"
        );

        await fillContent(textElement, group, async (group) => {
        return `<div class="col">
                  <div class="card mx-auto border-dark d-flex flex-column h-100">
                  <a class="class" href="/class/${group.id}">
                    <h5 class="card-header card-title text-dark">${group.name}</h5>
                     <div class="card-body text-dark">
                        ${group.description}
                      </div>
                </a>`;
      });

      document.querySelectorAll("a.class").forEach((anchorTag) => {
        anchorTag.addEventListener("click", loadClassLevels);
      });
      
      document.getElementById("create").addEventListener("click", () => {
          appendCreateGroupModal();
      });

      document.getElementById("join").addEventListener("click", () => {
        appendJoinGroupModal();
    });

      } else {
          var messages = [{ msg: "No perteneces a ninguna clase", desc: "Únete a una clase para acceder", buttonName: "", buttonMsg: "" }];
          await fillContent(textElement, messages, generateMSG);
          document.getElementById("join").addEventListener("click", () => {
              appendJoinGroupModal();
          });
      }
    } else {
      var messages = [{ msg: "No hay sesión iniciada", desc: "Inicia sesión para acceder a tus clases", buttonName: "altLogin", buttonMsg: "Iniciar Sesión" }];
      await fillContent(textElement, messages, generateMSG);
      document.getElementById("altLogin").addEventListener("click", () => {
        appendLoginModal();
      });
    }
  } catch(error) {
    if (error.status === 503) {
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }

}



export default async function loadWaitingRoom() {
    const cookie = sessionCookieValue();
    if(cookie!=null){
      document.getElementById("content").innerHTML = getRowHTML2();
    } else{
      document.getElementById("content").innerHTML = getRowHTML3();
    }
    
    const textElement = document.getElementById("display");
  
    try {
     
      if(cookie !== null){
        const classes = await fetchRequest(
          `${API_ENDPOINT}/group/findByUser/${cookie.id}`,
          "GET"
        );
        
        if(classes.length){

          const group = await fetchRequest(
            `${API_ENDPOINT}/group/${classes.map(a => a.group)}`,
            "GET"
          );

          await fillContent(textElement, group, async (group) => {
            return `<div class="col">
                      <div class="card mx-auto border-dark d-flex flex-column h-100">
                      <a class="class" href="/class/${group.id}">
                        <h5 class="card-header card-title text-dark">${group.name}</h5>
                         <div class="card-body text-dark">
                            ${group.description}
                          </div>
                    </a>`;
          });
    
          document.querySelectorAll("a.class").forEach((anchorTag) => {
            anchorTag.addEventListener("click", loadClassLevels);
          });
        document.getElementById("join").addEventListener("click", () => {
            appendJoinGroupModal();
        });

        } else {
            var messages = [{ msg: "No perteneces a ninguna clase", desc: "Únete a una clase para acceder", buttonName: "", buttonMsg: "" }];
            await fillContent(textElement, messages, generateMSG);
            document.getElementById("join").addEventListener("click", () => {
                appendJoinGroupModal();
            });
        }
      } else {
        var messages = [{ msg: "No hay sesión iniciada", desc: "Inicia sesión para acceder a tus clases", buttonName: "altLogin", buttonMsg: "Iniciar Sesión" }];
        await fillContent(textElement, messages, generateMSG);
        document.getElementById("altLogin").addEventListener("click", () => {
          appendLoginModal();
        });
      }
    } catch(error) {
      if (error.status === 503) {
        console.log("Received a 503 web error");
        window.location.reload();
      }
    }
  }
  