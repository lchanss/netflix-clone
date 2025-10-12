import "./styles/global.css";
import "./styles/page.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/carousel.css";
import "./styles/footer.css";
import "./styles/search.css";

import { initCarousel } from "./scripts/carousel.ts";
import { initHeader, initSearch } from "./scripts/header.ts";

async function initApp(): Promise<void> {
  // 개발 환경에서만 MSW 시작
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }

  initHeader();
  initSearch();

  // 검색 페이지인 경우
  if (window.location.pathname === "/search") {
    const { initSearchPage } = await import("./scripts/searchPage.ts");
    await initSearchPage();
  } else {
    // 홈 페이지인 경우
    await initCarousel();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
