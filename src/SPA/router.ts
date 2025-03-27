import {
  setPageCommunity,
  setPageClass,
  setPageWaitingRoom,
  setPageLevelEditor,
  setPageLevelPlayer,
  setPageOfficalCategoryById,
  setPageProfile,
  setPageHome,
  setClassLevelPlayer,
  setPageSetById,
  setPageTutorials,
  
} from "./app";

const router = {
  "/community": setPageCommunity,
  "/class": setPageClass, 
  "/waiting-room": setPageWaitingRoom,
  "/category": setPageOfficalCategoryById,
  "/classLevel": setClassLevelPlayer,
  "/set": setPageSetById,
  "/level": setPageLevelPlayer,
  "/editor": setPageLevelEditor,
  "/profile": setPageProfile,
  "/tutorials": setPageTutorials,
  "/offline": () => {},
  "/": setPageHome,
};

export default router;
