import loadCategoryById from "./loaders/categoryLoader";
import loadHome from "./loaders/homeLoader";
import loadLevelEditor from "./loaders/levelEditorLoader";
import loadLevelPlayer from "./loaders/levelPlayerLoader";
import loadCommunity from "./loaders/communityLoader";
import loadProfile, { sessionCookieValue } from "./loaders/profileLoader";
import XAPISingleton from "../xAPI/xapi";
const URL_EDITOR = "editor" 
const URL_PROFILE= "profile"
const URL_COMMUNITY = "community"
export async function setPageHome() {
  loadHome();
}

function getUserName(): string{
  const cookie = sessionCookieValue();
  let userName = "nl";
  if (cookie !== null) {
    userName = cookie.name;
  }
  return userName;
}

export async function setPageOfficalCategoryById(params: URLSearchParams) {
  let userName = getUserName();
  const idCategory = params.get("id") 
  let urlCategory = `category?id=${idCategory}`;
  loadCategoryById(idCategory);
  let statement = XAPISingleton.screenAccessedStament(userName, urlCategory);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageLevelPlayer(params: URLSearchParams) {
  let userName = getUserName();
  const idLevel = params.get("id") 
  let urlLevel = `level?id=${idLevel}`;
  loadLevelPlayer(idLevel);
  let statement = XAPISingleton.screenAccessedStament(userName, urlLevel);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageLevelEditor(levelId?: number) {
  let userName = getUserName();
  loadLevelEditor();
  let statement = XAPISingleton.screenAccessedStament(userName, URL_EDITOR);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageCommunity() {
  let userName = getUserName();
  loadCommunity();
  let statement = XAPISingleton.screenAccessedStament(userName, URL_COMMUNITY);
  await XAPISingleton.sendStatement(statement);
}

export async function setPageProfile() {
  let userName = getUserName();
  loadProfile();
  let statement = XAPISingleton.screenAccessedStament(userName, URL_PROFILE);
  await XAPISingleton.sendStatement(statement);
}
