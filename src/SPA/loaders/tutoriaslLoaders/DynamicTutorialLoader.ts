import { route } from "../../../client";
import config from "../../../Game/config.js";
import { fetchRequest, fillContent } from "../../utils";
import {marked} from 'marked';
import { sessionCookieValue } from "../profileLoader";


const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;
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
      <div>
    `;
}
async function parseMarkdown(){
  const text = (document.getElementById("markdownText")as HTMLInputElement).value;
  document.getElementById("tutorialContent").innerHTML = await marked.parse(text);
}

async function update(tutorialName){
  let postData = {
    name: tutorialName,
    content:(document.getElementById("markdownText")as HTMLInputElement).value
  };
  try{
    const update = await fetchRequest(`${API_ENDPOINT}/tutorial/update/`,"POST",JSON.stringify(postData));}
  catch{

  }
}

export default async function DynamicTutorialLoader(tutorialName) {
  const tutorial = await fetchRequest(`${API_ENDPOINT}/tutorial/get/${tutorialName}`, "GET");
  const session = sessionCookieValue();
  history.pushState({}, "", "/tutorials/classrooms");
  document.getElementById("content").innerHTML = getRowHTML(session);
  const divElement = document.getElementById("categories");
  if(tutorial){
    document.getElementById("tutorialContent").innerHTML = await marked.parse(tutorial[0].content);
    (document.getElementById("markdownText")as HTMLInputElement).value=tutorial[0].content;
  }
  $('#markdownBtn').on("click", ()=>{update(tutorialName)});
  $('#markdownText').on("keyup", parseMarkdown);

  try {


  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    
}
