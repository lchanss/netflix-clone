import "./styles/global.css";
import "./styles/page.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/carousel.css";
import "./styles/footer.css";
import "./styles/search.css";

import { initCarousel } from "./scripts/carousel.ts";
import { initHeader } from "./scripts/header.ts";

async function initApp(): Promise<void> {
  // 개발 환경에서만 MSW 시작
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }

  initHeader();
  await initCarousel(); // MSW가 시작된 후 캐러셀 초기화
}

document.addEventListener("DOMContentLoaded", initApp);
