import { route } from "../../../client";
import config from "../../../Game/config.js";
import { fetchRequest, fillContent } from "../../utils";
import {marked} from 'marked';
import { sessionCookieValue } from "../profileLoader";


const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;
const tutorialName="classroom";
/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML(session) {
  
    return `${session && session.role=="Admin" ? `<div class="container bg-body rounded-3 mt-3 pb-3">
        <label for="level_desc" class="form-label" >Markdown</label>
        <textarea class="form-control" id="markdownText"></textarea>
        <button class="btn btn-primary" id="markdownBtn">Update</button>
      </div>`:``}
      <div class="container bg-body rounded-3 mt-3 pb-3 text-center" id="tutorialContent">
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
async function parseMarkdown(){
  const text = (document.getElementById("markdownText")as HTMLInputElement).value;
  document.getElementById("tutorialContent").innerHTML = await marked.parse(text);
}

async function update(){
  let postData = {
    name: tutorialName,
    content:(document.getElementById("markdownText")as HTMLInputElement).value
  };
  try{
    const update = await fetchRequest(`${API_ENDPOINT}/tutorial/update/`,"POST",JSON.stringify(postData));}
  catch{

  }
}

export default async function classroomsTutorialLoader() {
  const tutorial = await fetchRequest(`${API_ENDPOINT}/tutorial/${tutorialName}`, "GET");
  const session = sessionCookieValue();
  history.pushState({}, "", "/tutorials/classrooms");
  document.getElementById("content").innerHTML = getRowHTML(session);
  const divElement = document.getElementById("categories");
  if(tutorial){
    document.getElementById("tutorialContent").innerHTML = await marked.parse(tutorial[0].content);
    (document.getElementById("markdownText")as HTMLInputElement).value=tutorial[0].content;
  }
  $('#markdownBtn').on("click", update);
  $('#markdownText').on("keyup", parseMarkdown);

  try {


  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    
}
