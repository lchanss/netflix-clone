import { carouselData } from "./data.js";

const carousels = new Map();

// 캐러셀 HTML 생성
function createCarouselHTML(carouselId, data) {
  const { title, itemsPerView, stepSize, items } = data;

  const carouselItemsHTML = items
    .map(
      (imageUrl, index) => `
    <div class="carousel-item">
      <img src="${imageUrl}" alt="영화썸네일 ${index + 1}" width="100%" />
    </div>
  `
    )
    .join("");

  return `
    <section class="content-row">
      <h2 class="content-title">${title}</h2>
      <div class="carousel-container" 
           data-carousel="${carouselId}" 
           data-items-per-view="${itemsPerView}" 
           data-step-size="${stepSize}">
        <div class="carousel-indicator"></div>
        <div class="carousel-wrapper">
          <div class="carousel-track">
            ${carouselItemsHTML}
          </div>
        </div>
        <button class="carousel-btn prev" data-direction="-1">
          <img src="/src/assets/icons/arrow_left_icon.svg" alt="이전" width="64px" />
        </button>
        <button class="carousel-btn next" data-direction="1">
          <img src="/src/assets/icons/arrow_right_icon.svg" alt="다음" width="64px" />
        </button>
      </div>
    </section>
  `;
}

// 모든 캐러셀 렌더링
function renderCarousels(containerId = "catalog") {
  const container = document.querySelector(`.${containerId}`);
  if (!container) {
    console.error(`Container with class '${containerId}' not found`);
    return;
  }

  const carouselsHTML = Object.entries(carouselData)
    .map(([carouselId, data]) => createCarouselHTML(carouselId, data))
    .join("");

  container.innerHTML = carouselsHTML;
}

function initCarousel() {
  // 먼저 캐러셀들을 렌더링
  renderCarousels();

  // 렌더링된 캐러셀들을 초기화
  document.querySelectorAll(".carousel-container").forEach((container) => {
    const carouselId = setupCarousel(container);

    // 인디케이터 생성
    createIndicator(container);

    container.querySelectorAll(".carousel-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const direction = parseInt(e.currentTarget.dataset.direction);
        moveCarousel(carouselId, direction);
      });
    });
  });
}

function setupCarousel(container) {
  const id = container.dataset.carousel || Math.random().toString(36);

  // HTML에서 설정값 읽기 (기본값 설정)
  const itemsPerView = parseInt(container.dataset.itemsPerView) || 6;
  let stepSize = parseInt(container.dataset.stepSize) || 1;

  // 검증: stepSize가 itemsPerView보다 클 수 없음
  if (stepSize > itemsPerView) {
    console.warn(
      `stepSize(${stepSize})가 itemsPerView(${itemsPerView})보다 클 수 없습니다. stepSize를 ${itemsPerView}로 조정합니다.`
    );
    stepSize = itemsPerView;
  }

  carousels.set(id, {
    currentIndex: 0,
    itemsPerView: itemsPerView,
    stepSize: stepSize,
    container: container,
  });

  updateCarouselButtons(carousels.get(id));
  return id;
}

function createIndicator(container) {
  const carousel = carousels.get(container.dataset.carousel);
  const items = container.querySelectorAll(".carousel-item");
  const indicator = container.querySelector(".carousel-indicator");

  // 실제로 이동 가능한 스텝 수 계산
  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  // 가능한 모든 위치를 stepSize 단위로 나누어 계산
  let possiblePositions = [];
  for (let i = 0; i <= maxIndex; i += carousel.stepSize) {
    possiblePositions.push(i);
  }

  // 마지막 위치가 maxIndex에 도달하지 못했다면 추가
  if (possiblePositions[possiblePositions.length - 1] < maxIndex) {
    possiblePositions.push(maxIndex);
  }

  const maxSteps = possiblePositions.length;

  // 기존 점들 제거
  indicator.innerHTML = "";

  // 새로운 점들 생성
  for (let i = 0; i < maxSteps; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    if (i === 0) dot.classList.add("active");
    indicator.appendChild(dot);
  }
}

function moveCarousel(carouselId, direction) {
  const carousel = carousels.get(carouselId);
  if (!carousel) return;

  const track = carousel.container.querySelector(".carousel-track");
  const items = track.querySelectorAll(".carousel-item");

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  // stepSize만큼 이동
  let newIndex = carousel.currentIndex + direction * carousel.stepSize;

  // 경계 체크
  if (newIndex < 0) newIndex = 0;
  if (newIndex > maxIndex) newIndex = maxIndex;

  carousel.currentIndex = newIndex;

  const moveAmount = -(newIndex * (100 / carousel.itemsPerView));
  track.style.transform = `translateX(${moveAmount}%)`;

  updateCarouselButtons(carousel);
  updateIndicator(carousel);
}

function updateCarouselButtons(carousel) {
  const prevBtn = carousel.container.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.container.querySelector(".carousel-btn.next");
  const items = carousel.container.querySelectorAll(".carousel-item");

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  prevBtn.disabled = carousel.currentIndex <= 0;
  nextBtn.disabled = carousel.currentIndex >= maxIndex;
}

function updateIndicator(carousel) {
  const indicator = carousel.container.querySelector(".carousel-indicator");
  if (!indicator) return;

  const dots = indicator.querySelectorAll(".dot");

  // createIndicator에서 사용한 것과 동일한 로직으로 현재 위치 찾기
  const totalItems =
    carousel.container.querySelectorAll(".carousel-item").length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  let possiblePositions = [];
  for (let i = 0; i <= maxIndex; i += carousel.stepSize) {
    possiblePositions.push(i);
  }

  if (possiblePositions[possiblePositions.length - 1] < maxIndex) {
    possiblePositions.push(maxIndex);
  }

  // 현재 인덱스가 possiblePositions 배열의 몇 번째인지 찾기
  const currentPage = possiblePositions.findIndex(
    (pos) => pos === carousel.currentIndex
  );

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPage);
  });
}

export { initCarousel };
