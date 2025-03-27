import BlocklyController from './Game/LevelPlayer/Blockly/BlocklyController';
import PhaserController from './Game/PhaserController';
import { getUserNameAndUUID } from './SPA/app';
import {
  appendLoginModal,
  checkSessionCookie,
} from './SPA/loaders/profileLoader';
import initLogger from './SPA/Logger';
import registerModals from './SPA/modals';
import router from './SPA/router';
import XAPISingleton from './xAPI/xapi';
import TourController from './SPA/webtour/TourController';
import { FlyoutMetricsManager } from 'blockly';


export async function route() {
  // Always destroy phaser game
  await PhaserController.destroyGame();
  BlocklyController.destroyWorkspace();

  const url = new URL(window.location.href);
  const setPageFunction = router[url.pathname];

  console.log(url.pathname);
  if (setPageFunction) {
    setPageFunction(url.searchParams);
  } else {
    router["/"]();
  }
}

function routeIfNewPath(newRoute: string, e: MouseEvent) {
  const url = new URL(window.location.href);
  if (url.pathname != newRoute) {
    document.querySelector("#navbarCollapse .nav-link.active")?.classList.remove("active");
    history.pushState({}, "", newRoute);
    route();
  }
  const [userName, uuid] = getUserNameAndUUID();
  const statement = XAPISingleton.iconInteractedStatement(uuid,userName,newRoute);
  XAPISingleton.sendStatement(statement);
  (e.currentTarget as HTMLElement).classList.add("active");
  e.stopPropagation();
}

function setNavbarListeners() {
  // Official Levels
  document.getElementById("official").addEventListener("click", (e: MouseEvent) =>{ 
    routeIfNewPath("/", e)}
  );

  // TODO: Manual
  document.getElementById("manual").addEventListener("click", (e: MouseEvent) =>{ 
    routeIfNewPath("/waiting-room", e)}
  );

  // Editor
  document.getElementById("editor").addEventListener("click", (e: MouseEvent) =>{ 
    routeIfNewPath("/editor", e)}
  );

  // Community Levels
  document.getElementById("community").addEventListener("click", (e: MouseEvent) =>{ 
    routeIfNewPath("/community", e)}
  );
    // Community Levels
    document.getElementById("tutorials").addEventListener("click", (e: MouseEvent) =>{ 
      routeIfNewPath("/tutorials", e)}
    );

  // Profile
  document.getElementById("profile").addEventListener("click", (e: MouseEvent) => {
    if (!checkSessionCookie()) {
      appendLoginModal();
    } else {
      routeIfNewPath("/profile", e)
    }
  });
}

(function () {
  window.addEventListener("popstate", route);
  window.addEventListener("beforeunload", function(event) {
    localStorage.removeItem('MY_UUID');
  });
  
  setNavbarListeners();

  route();

  registerModals();

  initLogger();

  TourController.init();
})()