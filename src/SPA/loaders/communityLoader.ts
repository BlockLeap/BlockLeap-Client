import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";
import { sessionCookieValue } from "./profileLoader";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;
const itemsPerPage=6;
/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML() {
  return `<div class="container">
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
          <div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>
          <div id="pageDiv" class="d-flex justify-content-center mt-3">
            <nav aria-label="pages">
              <ul class="pagination pagination-lg" id="paginationList">
              </ul>
            </nav>
          </div>`;
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


async function loadPagination(event) {
  event.preventDefault();
  const anchorTag = event.target.closest("a.getPage");   
  const page = anchorTag.href.split("level/community/levels/")[1];
  history.pushState({page}, "", `community?page=${page}`);
  loadLevels(page);
}

async function loadPageNav(pages,currentPage){
  const list= document.getElementById("paginationList");
  let items='';
  for(let i=1; i<=pages;i++){
    if(i==currentPage)
      items+=`<li class="page-item"><a class="page-link active getPage" href="${API_ENDPOINT}/level/community/levels/${i}">${i}</a></li>`
    else
      items+=`<li class="page-item"><a class="page-link getPage" href="${API_ENDPOINT}/level/community/levels/${i}">${i}</a></li>`
  }
  list.innerHTML=items;
}
async function filterSearch(){
  loadLevels(1);
}
async function loadLevels(page){
  const divElement = document.getElementById("categories");
  const selectData=$('#levelSelect').select2('data');
  const map=selectData.map(i=>i.text);
  let data={page:page,tags:map};
    const res = await fetchRequest(
      `${API_ENDPOINT}/level/community/levels/${JSON.stringify(data)}`,
      "GET"
    );
    const levels= res.rows;
    const levelsWithStatistics = await loadLevelStats(levels);
    let totalPages=(res.count/itemsPerPage);if((res.count%itemsPerPage)!=0)totalPages++;
    await fillContent(divElement, levelsWithStatistics, generateLevelDiv);
    loadPageNav(totalPages,page);
    // Add getLevel event listener
    document.querySelectorAll("a.getLevel").forEach((level) => {
      level.addEventListener("click", playLevel);
    });
    document.querySelectorAll("a.getPage").forEach((page) => {
      page.addEventListener("click", loadPagination);
    });
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
export default async function loadCommunity(page='1') {
  document.getElementById("content").innerHTML = getRowHTML();
  const divElement = document.getElementById("categories");

  // Load placeholders
  await fillContent(divElement, new Array(10), generateCommunityDivPlaceholder);
  $('#levelSelect').select2({placeholder:"Filter by tags",allowClear:true});
  $('#filterButton').on("click",filterSearch);
  try {
    loadLevels(page);
  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
  

}
