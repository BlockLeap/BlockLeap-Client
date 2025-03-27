import { route } from "../../client";
import config from "../../Game/config.js";
import { fetchRequest, fillContent } from "../utils";

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

/**
 *
 * @returns String of HTMLDivElement for showing levels/categories
 */
function getRowHTML() {
  return '<div class="row row-cols-1 g-2 w-75 mx-auto pt-3" id="categories"></div>';
}

export default async function loadTutorials() {
  document.getElementById("content").innerHTML = getRowHTML();
  const divElement = document.getElementById("categories");
/*
  // Load placeholders
  await fillContent(divElement, new Array(10), generateCategoryDivPlaceholder);

  try {
    const categories = await fetchRequest(
      `${API_ENDPOINT}/level/categories`,
      "GET"
    );

    await fillContent(divElement, categories, generateCategoryDiv);

    document.querySelectorAll("a.category").forEach((anchorTag) => {
      anchorTag.addEventListener("click", loadCategoryLevels);
    });

  } catch(error) {
    if (error.status === 503) { // Offline mode
      console.log("Received a 503 web error");
      window.location.reload();
    }
  }
    */
}
