import * as bootstrap from 'bootstrap';
import { route } from "../../client";

import config from '../../Game/config.js';
import { fetchRequest, fillContent } from '../utils';
import XAPISingleton from '../../xAPI/xapi.js';
import { getUserNameAndUUID, setPageHome } from '../app.js';
import { loadLevel } from './levelPlayerLoader';
const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
// Variable para controlar si el evento click ya se agregó al botón
let registerSubmitBtnAdded = false;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML(user) {
  const createSetButton = user.role === 'Profesor' ? `
  <div class="text-center w-100">
   <button id="createSetBtn" class="btn btn-success btn-lg w-30">Crear Set de Niveles</button>
   </div>
` : '';
  return `<div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
           <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">TUS SETS</h2>
            ${createSetButton}
           <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="sets"></div>
          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">TUS NIVELES</h2>
           <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
          <div class="container mb-3">
            <div id="selectDiv" class="mt-3 p-1">
              <select id="levelSelect" name="tags[]" multiple="multiple" style="width: 100%">
                <option value="LP">Loops</option>
                <option value="VR">Variable</option>
                <option value="BS">Basic</option>
              </select>
            </div>
            <div class="mt-3">
              <button class="btn btn-primary w-100 px-5" type="button" id="filterButton"><i class="bi bi-search"></i> Search
              </button>
            </div>
          </div>
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
  return `<div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
          <h2 class="text-center w-75 mx-auto pt-3" style="color: white;">TUS NIVELES</h2>
           <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="levels"></div>
           <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2 w-75 mx-auto" id="display"></div>
  `;
}

export function sessionCookieValue() {
  const sessionInfo = getCookieValue("session");
  if (sessionInfo) {
    const cleanedSessionInfo = sessionInfo.substring(2);
    const sessionObject = JSON.parse(cleanedSessionInfo);
    return sessionObject;
  } else {
    return null;
  }
}

function getCookieValue(cookieName) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function checkSessionCookie() {
  const cookies = document.cookie.split("; ");
  const sessionCookie = cookies.find((cookie) => cookie.startsWith("session="));
  return sessionCookie !== undefined;
}

async function userLogin(modal : bootstrap.Modal) {
  const username = (document.getElementById("username") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  const postData = {
    username,
    password: password,
  };

  try {
    await fetchRequest(
      `${API_ENDPOINT}/user/login`,
      "POST",
      JSON.stringify(postData),
      'include',
    );
    modal.hide();
    const [userName, uuid] = getUserNameAndUUID();
    const statement = XAPISingleton.loginStatement(uuid, username);
    XAPISingleton.sendStatement(statement);
  } catch (error) {
      if (error.status === 401 || error.status === 404) {
        const errorElement = document.getElementById("text-error-login");
        errorElement.innerText = "Error con el username o contraseña";
        errorElement.style.color = "red";
      }
      else if (error.status === 503) { // Offline mode
        console.log("Received a 503 web error");
        window.location.reload();
      }
      else {
      console.error('Error general:', error);
    }
  }
}

async function useRegister(modal : bootstrap.Modal):Promise<any> {
  const userName = (document.getElementById("userName") as HTMLInputElement)
    .value;
  if (userName.length < 3) {
    const errorElement = document.getElementById("text-error-register");
    errorElement.innerText = "El nombre de usuario debe tener al menos 3 letras";
    errorElement.style.color = "red";
    return; 
  }

  const userPassword = (
    document.getElementById("userPassword") as HTMLInputElement
  ).value;

  if (!PASSWORD_REGEX.test(userPassword)) {
    const errorElement = document.getElementById("text-error-register");
    errorElement.innerText = "La contraseña debe contener al menos 1 mayúscula, 1 número y tener más de 5 letras";
    errorElement.style.color = "red";
    return; 
  }
  const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value;
  if (userPassword !== confirmPassword) {
    const errorElement = document.getElementById("text-error-register");
    errorElement.innerText = "Las contraseñas no coinciden";
    errorElement.style.color = "red";
    return; 
  }
  const postData = {
    userName: userName,
    userPassword: userPassword,
  };

  try{
    await fetchRequest(
      `${API_ENDPOINT}/user/create`,
      "POST",
      JSON.stringify(postData)
    );
    modal.hide();
    alert("Registro correcto, inicia sesión")
  }
  catch(error) {
    if (error.status === 409) {
      const errorElement = document.getElementById("text-error-register");
      errorElement.innerText = "El username ya existe";
      errorElement.style.color = "red";
    }
    else if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
    else {
      console.error('Error general:', error);
    }
  }
}

export function appendLoginModal() {
  let loginModalHtml = `
        <div id="loginModal" class="modal fade" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="loginModalLabel">Inicio de Sesión</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" class="form-control" id="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close" id="loginReq">Iniciar Sesión</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" id="registerBtn">¿No tienes cuenta?</button>
                        <span id="text-error-login"></span>
                    </div>
                </div>
            </div>
        </div>
    `;

  let loginModal = document.createElement("div");
  loginModal.innerHTML = loginModalHtml;
  document.body.appendChild(loginModal);

  let loginModalElement = document.querySelector("#loginModal");
  let loginModalInstance = new bootstrap.Modal(loginModalElement);

  loginModalElement.addEventListener("hidden.bs.modal", function () {
    loginModalElement.remove();
  });

  loginModalInstance.show();

  let registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", function () {
      loginModalInstance.hide();
      appendRegisterModal();
    });
  }

  let loginBtn = document.getElementById("loginReq");
  if (loginBtn) {
    loginBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      await userLogin(loginModalInstance);
    });
  }
}

async function appendCreateSetModal(user) {
  const itemsPerPage=8;
  let sdata={user_id:user.id,page:1,tags:""};
  const res = await fetchRequest(
    `${API_ENDPOINT}/level/paginatedUserLevels/${JSON.stringify(sdata)}`,
    "GET"
  );
  const userLevels= res.rows;
  let totalPages=(res.count/itemsPerPage);if((res.count%itemsPerPage)!=0)totalPages++;
  loadPageNav(totalPages,1,"paginationList","getPage");

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
                          <div class="mt-3 px-2">
                            <select id="modalLevelSelect" name="tags[]" multiple="multiple" style="width: 75%">
                              <option value="LP">Loops</option>
                              <option value="VR">Variable</option>
                              <option value="BS">Basic</option>
                            </select>
                          </div>
                          <div class="mt-3">
                            <button class="btn btn-primary w-75" type="button" id="modalFilterButton"><i class="bi bi-search"></i> Search
                            </button>
                          </div>
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
                  <div id="pageDiv" class="d-flex justify-content-center mt-3">
                    <nav aria-label="pages">
                      <ul class="pagination" id="createSetPaginationList">
                      </ul>
                    </nav>
                  </div>
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


  $('#modalLevelSelect').select2({placeholder:"Filter by tags",allowClear:true,dropdownParent: $('#createSetModal')});
  $('#modalFilterButton').on("click",()=>{loadModalLevels(1)});

  let createSetModalElement = document.querySelector("#createSetModal");
  let createSetModalInstance = new bootstrap.Modal(createSetModalElement);

  createSetModalElement.addEventListener("hidden.bs.modal", function () {
      createSetModalElement.remove();
  });

  createSetModalInstance.show();

  loadPageNav(totalPages,1,"createSetPaginationList","getModalPage");
  document.querySelectorAll("a.getModalPage").forEach((page) => {
    page.addEventListener("click", loadModalPagination);
  });

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
          user:user.id
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

function appendRegisterModal() {
  let registerModalHtml = `
        <div id="registerModal" class="modal fade" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="registerModalLabel">Registro de Cuenta</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class = "text-success" >Nombre con más de 3 letras. La contraseña debe contener al menos 1 mayúscula, 1 número y tener más de 5 letras </p>
                        <form id="registerForm">
                            <div class="mb-3">
                                <label for="userName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="userName" required>
                            </div>
                            <div class="mb-3">
                                <label for="userPassword" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="userPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                                <input type="password" class="form-control" id="confirmPassword" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary" id="registerSubmitBtn">Registrarse</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <span id="text-error-register"></span>
                    </div>
                </div>
            </div>
        </div>
    `;

  let registerModal = document.createElement("div");
  registerModal.innerHTML = registerModalHtml;
  document.body.appendChild(registerModal);

  let registerModalElement = document.querySelector("#registerModal");
  let registerModalInstance = new bootstrap.Modal(registerModalElement);

  registerModalElement.addEventListener("hidden.bs.modal", function () {
    registerModalElement.remove();
  });

  registerModalInstance.show();

  let registerSubmitBtn = document.getElementById("registerSubmitBtn");
  if (!registerSubmitBtnAdded) {
    registerSubmitBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      await useRegister(registerModalInstance);
    });
    registerSubmitBtnAdded = true; // Marcar que el event listener se ha agregado
  }
}

/**
 *
 * @returns String of HTMLDivElement of a category placeholder
 */
function generateProfilePlaceholder() {}

/**
 *
 * @param {Object} user with id, name and role
 * @returns String of HTMLDivElement
 */
async function generateProfileDiv(data) {
  

  // Verifica si el rol del usuario es "Profesor"


  return `
    <div class="container">
      <!-- Perfil del usuario -->
      <div class="row w-100 mb-4">
        <div class="col-12">
          <div class="card mx-auto border-dark d-flex flex-column h-100">
            <h5 class="card-header card-title text-dark">
              Tus Datos
            </h5>
            <div class="card-body text-dark">
              <p> Nombre: ${data.user.name}</p>
              <p> Rol: ${data.user.role}</p>
              <p class="card-subtitle mb-2 text-muted">
                Niveles Oficiales Completados: ${data.officialLevelCompleted}
              </p>
              <p class="card-subtitle mb-2 text-muted">
                Estrellas totales conseguidas: ${data.totalStars}
              </p>
              <button type="submit" class="btn btn-danger" id="logoutBtn">
                  Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


async function generateLevelDiv(level) {
  if (!level) {
    throw new Error("Invalid level data");
  }

  const { id, miniature, title, description = "EditorLevel" } = level;

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
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>`;
}

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

export async function loadSet(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.set");
  const id = anchorTag.href.split("set/")[1];
  history.pushState({ id }, "", `set?id=${id}`);
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

async function logout(){
  let logoutSubmitBtn = document.getElementById("logoutBtn");
  logoutSubmitBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    try {
      await fetchRequest(
        `${API_ENDPOINT}/user/logout`,
        "DELETE",
        null,
        'include'
      );
      const [userName, uuid] = getUserNameAndUUID();
      const statement = XAPISingleton.logoutStatement(uuid, userName);
      XAPISingleton.sendStatement(statement);
      localStorage.removeItem('MY_UUID');
      setPageHome();
    } catch(error) {
      if (error.status === 503) { // Offline mode
        console.log("Received a 503 web error");
        window.location.reload();
      }
    }
  });
}

async function playLevel(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.getLevel");
  const id = anchorTag.href.split("level/")[1];
  history.pushState({ id }, "", `classLevel?id=${id}`);

  route();
}

async function loadPageNav(pages,currentPage,paginationList,className){
  const user = sessionCookieValue();
  const list= document.getElementById(paginationList);
  let items='';
  for(let i=1; i<=pages;i++){
    if(i==currentPage)
      items+=`<li class="page-item"><a class="page-link active ${className}" href="${API_ENDPOINT}/level/userlevels/${user.id}/${i}">${i}</a></li>`
    else
      items+=`<li class="page-item"><a class="page-link ${className}" href="${API_ENDPOINT}/level/userlevels/${user.id}/${i}">${i}</a></li>`
  }
  list.innerHTML=items;
}
async function loadPagination(event) {
  event.preventDefault();
  const user = sessionCookieValue();
  const anchorTag = event.target.closest("a.getPage");   
  const page = anchorTag.href.split(`level/userlevels/${user.id}/`)[1];
  loadLevels(page);
}

async function loadModalPagination(event) {
  event.preventDefault();
  const user = sessionCookieValue();
  const anchorTag = event.target.closest("a.getModalPage");   
  const page = anchorTag.href.split(`level/userlevels/${user.id}/`)[1];
  loadModalLevels(page);
}
async function loadModalLevels(page){
  const itemsPerPage=8;
  const user = sessionCookieValue();
  const selectData=$('#modalLevelSelect').select2('data');
  const map=selectData.map(i=>i.text);
  let sdata={user_id:user.id,page:page,tags:map};
  const res = await fetchRequest(
    `${API_ENDPOINT}/level/paginatedUserLevels/${JSON.stringify(sdata)}`,
    "GET"
  );
  let totalPages=(res.count/itemsPerPage);if((res.count%itemsPerPage)!=0)totalPages++;
  loadPageNav(totalPages,page,"createSetPaginationList","getModalPage");
  let levelDiv=document.getElementById("setLevels");
  levelDiv.innerHTML=res.rows.map(level => `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="${level.id}" id="level-${level.id}">
      <label class="form-check-label" for="level-${level.id}">
        ${level.title}
      </label>
    </div>
  `).join('');
  document.querySelectorAll("a.getModalPage").forEach((page) => {
    page.addEventListener("click", loadModalPagination);
  });
}
async function loadLevels(page){
  const user = sessionCookieValue();
  const itemsPerPage=6;
  const divElement = document.getElementById("categories");
  const selectData=$('#levelSelect').select2('data');
  const map=selectData.map(i=>i.text);
  let sdata={user_id:user.id,page:page,tags:map};
  const res = await fetchRequest(
    `${API_ENDPOINT}/level/paginatedUserLevels/${JSON.stringify(sdata)}`,
    "GET"
  );
  const levels= res.rows;
  let totalPages=(res.count/itemsPerPage);if((res.count%itemsPerPage)!=0)totalPages++;
  loadPageNav(totalPages,page,"paginationList","getPage");
  if(levels.length!=0){
    const levelDiv = document.getElementById("display");
    await fillContent(levelDiv, levels, generateLevelDiv);
    document.querySelectorAll("a.levels").forEach((levelDiv) => {
      levels.addEventListener("click", loadLevel);
    });
  }else{
    var messages=[{msg:"No levels found",desc:"You can create levels with the level editor",buttonName:"",buttonMsg:""}];
    const textElement = document.getElementById("display");
    await fillContent(textElement, messages, generateMSG);
  }
    // Add getLevel event listener
  document.querySelectorAll("a.getLevel").forEach((level) => {
    level.addEventListener("click", playLevel);
  });
  document.querySelectorAll("a.getPage").forEach((page) => {
    page.addEventListener("click", loadPagination);
  });
}
async function filterSearch(){
  loadLevels(1);
}

export default async function loadProfile() {

  
  


  try {const user = sessionCookieValue();
    if(user.role=="Profesor"){
      document.getElementById("content").innerHTML = getRowHTML(user);
    } else{
      document.getElementById("content").innerHTML = getRowHTML2();
    }
    const divElement = document.getElementById("categories");
    const officialLevelCompleted = await fetchRequest(
      `${API_ENDPOINT}/user/officialLevelsCompleted`,
      "GET",
      null,
      'include',
    );
    const totalStars = await fetchRequest(
      `${API_ENDPOINT}/user/totalStars/${user.id}`,
      "GET"
    );

    /*const userLevels = await fetchRequest(
      `${API_ENDPOINT}/level/userLevels/${user.id}`,
      "GET"
    );*/  
      const userSets = await fetchRequest(
            `${API_ENDPOINT}/set/userSets/${user.id}`,
            "GET"
      );


   // divElement.innerHTML = await generateProfileDiv(user, totalStars, officialLevelCompleted);

    const data = {
      user: user,
      totalStars: totalStars,
      officialLevelCompleted: officialLevelCompleted,
    }
    $('#levelSelect').select2({placeholder:"Filter by tags",allowClear:true});
    $('#filterButton').on("click",filterSearch);

    await fillContent(divElement, [data], generateProfileDiv);

    loadLevels(1);


    if(userSets.length!=0){
      const setDiv = document.getElementById("sets");
      await fillContent(setDiv, userSets, generateSetDiv);
      document.querySelectorAll("a.set").forEach((userSets) => {
        userSets.addEventListener("click", loadSet);
       });
  }

     // Add getLevel event listener
     if(user.role=="Profesor"){
      document.getElementById("createSetBtn").addEventListener("click", (e: MouseEvent) => {
        appendCreateSetModal(user); 
     });
     }
      
    document.querySelectorAll("a.getLevel").forEach((level) => {
      level.addEventListener("click", playLevel);
    });
    logout();
  } catch(error) {
    if (error.status === 503) {
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
}
