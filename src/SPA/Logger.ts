import config from '../Game/config.js';
import { sessionCookieValue } from './loaders/profileLoader';
import { fetchRequest } from './utils';

const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

export default async function initLogger() {
  document.addEventListener("updateStatistic", (event: CustomEvent) => {
    const cookie = sessionCookieValue();
    const hasLost : Boolean = event.detail.hasLost;
    let stars : integer;
    if(hasLost)
      stars = 0
    else
      stars = 1;
    if (cookie !== null) {
      const urlParams = new URLSearchParams(window.location.search);
      const levelId = urlParams.get('id');
      const postData = {
        user: cookie.id,
        level: levelId,
        stars,
      };

      fetchRequest(
        `${API_ENDPOINT}/play`,
        "POST",
        JSON.stringify(postData)
      );
      
    }
  });
}