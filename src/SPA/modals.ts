import * as bootstrap from 'bootstrap';

import { route } from '../client';
import { restartCurrentLevel } from './loaders/levelPlayerLoader';
import {exitToCategory} from './app';
let victoryModalInstance;
let defeatModalInstance;

export default async function registerModals() {
  // Victory Modal
  const nextLevelButton = document.querySelector("#victoryModal .btn-primary");
  nextLevelButton.addEventListener("click", (event) => {
    const url = new URL(window.location.href);
    let levelId = parseInt(url.searchParams.get("id"));
    const id = `${++levelId}`;

    // Change to new level
    history.pushState({ id }, "", `level?id=${id}`);
    route();
  });
  
  const retryVictoryButton = document.querySelector("#victoryModal #retryLevelButton1");
  retryVictoryButton.addEventListener("click", (event) => {
    restartCurrentLevel(); // Calls the function to restart the level
  });

  const vExitLevelBtn = document.querySelector("#victoryModal #exitLevelButton");
  vExitLevelBtn.addEventListener("click", (event) => {
    let categoryIndex = document.getElementById("content").getAttribute("categoryIndex");
    exitToCategory(categoryIndex);
  });
  
  

  document.addEventListener("win", (event) => {
    const { stars } = (<CustomEvent>event).detail;

    document.querySelector("#victoryModal .stars").innerHTML = `${'<i class="bi bi-star-fill gold-star" style="font-size: 2rem;"></i>'.repeat(stars)}${'<i class="bi bi-star gold-star" style="font-size: 2rem;"></i>'.repeat(3 - stars)}`;
    if (!victoryModalInstance) {
      victoryModalInstance = new bootstrap.Modal("#victoryModal");
    }
    victoryModalInstance.show();
  });

  // Defeat modal
  const retryLevelButton = document.querySelector("#defeatModal .btn-primary");
  retryLevelButton.addEventListener("click", (event) => {
    restartCurrentLevel();
  });

  const dExitLevelBtn = document.querySelector("#defeatModal #exitLevelButton2");
  dExitLevelBtn.addEventListener("click", (event) => {
    let categoryIndex = document.getElementById("content").getAttribute("categoryIndex");
    exitToCategory(categoryIndex);
  });

  document.addEventListener("lose", (e) => {
    // document.querySelector("#defeatModal .stars").innerHTML = '<i class="fas fa-star"></i>'.repeat(0);
    if (!defeatModalInstance)
      defeatModalInstance = new bootstrap.Modal(
        document.getElementById("defeatModal")
      );
    defeatModalInstance.show();
  });
}
