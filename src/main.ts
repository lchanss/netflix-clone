import "./styles/global.css";
import "./styles/page.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/carousel.css";
import "./styles/footer.css";

import { initCarousel } from "./scripts/carousel.ts";
import { initHeader } from "./scripts/header.ts";

// 앱 전체 초기화
function initApp(): void {
  initHeader();
  initCarousel();
}

document.addEventListener("DOMContentLoaded", initApp);
