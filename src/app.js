import { initCarousel } from "./carousel.js";
import { initHeader } from "./header.js";

// 앱 전체 초기화
function initApp() {
  console.log("App initializing...");

  // 각 모듈 초기화
  initHeader();
  initCarousel();

  console.log("App initialized successfully");
}

// DOM이 로드되면 앱 초기화
document.addEventListener("DOMContentLoaded", initApp);

// 또는 window.onload 사용 (이미지까지 모두 로드 후)
// window.addEventListener('load', initApp);
