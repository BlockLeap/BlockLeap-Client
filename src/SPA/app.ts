import loadCategoryById from "./loaders/categoryLoader";
import loadHome from "./loaders/homeLoader";
import loadLevelEditor from "./loaders/levelEditorLoader";
import loadWaitingRoom from "./loaders/waitingRoomLoader";
import { loadWaitingRoomProfesor } from "./loaders/waitingRoomLoader";
import playLevelById from "./loaders/levelPlayerLoader";
import { playClassLevelById } from "./loaders/levelPlayerLoader";
import loadCommunity from "./loaders/communityLoader";
import loadSetById from "./loaders/setLoader";
import loadProfile, { sessionCookieValue } from "./loaders/profileLoader";
import XAPISingleton from "../xAPI/xapi";
import { getSpecificUUID } from "./utils";
import loadClass from "./loaders/classLoader";
import {loadClassProfesor} from "./loaders/classLoader";
const URL_EDITOR = "editor" 
const URL_PROFILE= "profile"
const URL_COMMUNITY = "community"

export async function setPageHome() {
  const navBarCollapse = document.querySelector("#official");
  navBarCollapse.classList.add("active");
  loadHome();
}

export function getUserNameAndUUID(): [string,string]{
  const cookie = sessionCookieValue();
  const uuid: string = getSpecificUUID();
  let userName = uuid;
  if (cookie !== null) {
    userName = cookie.name;
  }
  return [userName,uuid];
}

export async function setPageOfficalCategoryById(params: URLSearchParams) {
  const [userName, uuid] = getUserNameAndUUID();
  const idCategory = params.get("id") 
  const navBarCollapse = document.querySelector("#official");
  navBarCollapse.classList.add("active");
  let urlCategory = `category?id=${idCategory}`;
  loadCategoryById(idCategory);
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, urlCategory);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageSetById(params: URLSearchParams) {
  const [userName, uuid] = getUserNameAndUUID();
  const idSet= params.get("id") 
  let urlCategory = `set?id=${idSet}`;
  //loadSetById(idSet);
  loadSetById(idSet);
}

export async function setPageLevelPlayer(params: URLSearchParams) {
  const [userName, uuid] = getUserNameAndUUID();
  const idLevel = params.get("id") 
  const navBarCollapse = document.querySelector("#official");
  navBarCollapse.classList.add("active");
  let urlLevel = `level?id=${idLevel}`;
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, urlLevel);
  await XAPISingleton.sendStatement(statement);
  playLevelById(idLevel);
}

export async function setClassLevelPlayer(params: URLSearchParams) {
  const [userName, uuid] = getUserNameAndUUID();
  const idLevel = params.get("id")
  const navBarCollapse = document.querySelector("#official");
  navBarCollapse.classList.add("active");
  let urlLevel = `level?id=${idLevel}`;
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, urlLevel);
  await XAPISingleton.sendStatement(statement);
  playClassLevelById(idLevel);
}

export async function setPageCommunity(params: URLSearchParams) {
  const [userName, uuid] = getUserNameAndUUID();
  const page = params.get("page");
  const navBarCollapse = document.querySelector("#community");
  navBarCollapse.classList.add("active");

  if(page)
    loadCommunity(page);
  else loadCommunity();
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, URL_COMMUNITY);
  await XAPISingleton.sendStatement(statement);
}
export async function setPageLevelEditor(levelId?: number) {
  const [userName, uuid] = getUserNameAndUUID();
  const navBarCollapse = document.querySelector("#editor");
  navBarCollapse.classList.add("active");
  loadLevelEditor();
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, URL_EDITOR);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageClass(params: URLSearchParams) {
  const cookie = sessionCookieValue();
  const [userName, uuid] = getUserNameAndUUID();
  const idClass = params.get("id") 
  let role = "";
  if(cookie!=null){
    role = cookie.role;
  }
  const navBarCollapse = document.querySelector("#classroom");
  navBarCollapse.classList.add("active");

  const page = params.get("page");
  if(page)
    if(role=="Profesor"){
      loadClassProfesor(idClass,page);
    } else{
      loadClass(idClass,page);
    }
  else {
    if(role=="Profesor"){
      loadClassProfesor(idClass);
    } else{
      loadClass(idClass);
    }
  }


  
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, URL_COMMUNITY);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageWaitingRoom(params: URLSearchParams) {
  const cookie = sessionCookieValue();
  const [userName, uuid] = getUserNameAndUUID();
  let role = "";
  if(cookie!=null){
    role = cookie.role;
    
  }
  const navBarCollapse = document.querySelector("#classroom");
  navBarCollapse.classList.add("active");
 
  if(role=="Profesor"){
     loadWaitingRoomProfesor();
  } else {
     loadWaitingRoom();
  }
    
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, URL_EDITOR);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageProfile() {
  const [userName, uuid] = getUserNameAndUUID();
  const navBarCollapse = document.querySelector("#profile");
  navBarCollapse.classList.add("active");
  loadProfile();
  let statement = XAPISingleton.screenAccessedStatement(uuid, userName, URL_PROFILE);
  await XAPISingleton.sendStatement(statement);
}

export async function exitToCategory(categoryIndex: string) {
  window.location.href = `/category?id=${categoryIndex}`;
}