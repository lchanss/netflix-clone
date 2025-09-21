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

  // 무한 캐러셀을 위한 복제 아이템 생성
  createClonedItems(container, itemsPerView);

  const track = container.querySelector(".carousel-track");
  const totalOriginalItems = track.querySelectorAll(
    ".carousel-item:not(.clone)"
  ).length;

  carousels.set(id, {
    currentIndex: 0,
    realCurrentIndex: 0, // 실제 원본 아이템의 인덱스
    itemsPerView: itemsPerView,
    stepSize: stepSize,
    container: container,
    totalOriginalItems: totalOriginalItems,
    isTransitioning: false,
  });

  // 초기 위치 설정 (원본 배열 첫 번째 아이템으로 이동)
  const carousel = carousels.get(id);
  carousel.currentIndex = itemsPerView;
  updateTrackPosition(carousel, false); // 애니메이션 없이 초기 위치 설정
  updateCarouselButtons(carousel);

  return id;
}

// 무한 스크롤을 위한 복제 아이템 생성
function createClonedItems(container, itemsPerView) {
  const track = container.querySelector(".carousel-track");
  const items = Array.from(track.querySelectorAll(".carousel-item"));

  // 앞쪽에 추가할 복제본: 마지막 itemsPerView개를 순서 그대로
  const frontClones = items.slice(-itemsPerView).map((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    return clone;
  });

  // 뒤쪽에 추가할 복제본: 첫 번째 itemsPerView개를 순서 그대로
  const backClones = items.slice(0, itemsPerView).map((item) => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    return clone;
  });

  // DocumentFragment를 사용해서 한 번에 DOM 조작
  const frontFragment = document.createDocumentFragment();
  const backFragment = document.createDocumentFragment();

  // Fragment에 복제본들 추가
  frontClones.forEach((clone) => frontFragment.appendChild(clone));
  backClones.forEach((clone) => backFragment.appendChild(clone));

  // 한 번에 DOM에 추가
  track.insertBefore(frontFragment, track.firstChild);
  track.appendChild(backFragment);
}

function createIndicator(container) {
  const carousel = carousels.get(container.dataset.carousel);
  const originalItems = container.querySelectorAll(
    ".carousel-item:not(.clone)"
  );
  const indicator = container.querySelector(".carousel-indicator");

  // 실제로 이동 가능한 스텝 수 계산
  const totalItems = originalItems.length;
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

  const indicatorCount = possiblePositions.length;

  // 점들 생성
  for (let i = 0; i < indicatorCount; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    if (i === 0) dot.classList.add("active");
    indicator.appendChild(dot);
  }
}

function moveCarousel(carouselId, direction) {
  const carousel = carousels.get(carouselId);
  if (!carousel || carousel.isTransitioning) return;

  carousel.isTransitioning = true;

  const totalItems = carousel.totalOriginalItems;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  // 무한 루프 체크: 경계에 도달했는데 더 이동하려고 하는 경우
  const isAtEnd = carousel.realCurrentIndex === maxIndex && direction > 0;
  const isAtStart = carousel.realCurrentIndex === 0 && direction < 0;

  if (isAtEnd) {
    // 끝에서 다음 버튼 클릭 시 복제본으로 자연스럽게 이동 (itemsPerView만큼)
    carousel.currentIndex += carousel.itemsPerView; // 복제본 영역으로 itemsPerView만큼 이동
    carousel.realCurrentIndex = 0; // 실제로는 처음을 가리킴
    carousel.willSnapToOriginal = true; // 애니메이션 후 원본으로 이동 플래그
  } else if (isAtStart) {
    // 시작에서 이전 버튼 클릭 시 복제본으로 자연스럽게 이동 (itemsPerView만큼)
    carousel.currentIndex -= carousel.itemsPerView; // 앞쪽 복제본 영역으로 itemsPerView만큼 이동
    carousel.realCurrentIndex = maxIndex; // 실제로는 끝을 가리킴
    carousel.willSnapToOriginal = true; // 애니메이션 후 원본으로 이동 플래그
  } else {
    // 일반적인 이동: stepSize만큼, 경계 내에서만
    let newRealIndex =
      carousel.realCurrentIndex + direction * carousel.stepSize;

    // 경계 체크 및 조정
    if (direction > 0) {
      // 다음으로 이동할 때: maxIndex를 초과하지 않도록 조정
      if (newRealIndex > maxIndex) {
        newRealIndex = maxIndex;
      }
    } else {
      // 이전으로 이동할 때: 0 미만으로 가지 않도록 조정
      if (newRealIndex < 0) {
        newRealIndex = 0;
      }
    }

    // 실제 이동 거리 계산
    const actualStep = newRealIndex - carousel.realCurrentIndex;

    carousel.currentIndex += actualStep;
    carousel.realCurrentIndex = newRealIndex;
    carousel.willSnapToOriginal = false;
  }

  updateTrackPosition(carousel, true);

  // 경계 체크 및 무한 루프 처리
  setTimeout(() => {
    if (carousel.willSnapToOriginal) {
      snapToOriginalPosition(carousel);
    }
    carousel.isTransitioning = false;
  }, 400); // CSS transition 시간과 맞춤

  updateCarouselButtons(carousel);
  updateIndicator(carousel);
}

// 애니메이션 후 원본 위치로 몰래 이동
function snapToOriginalPosition(carousel) {
  const track = carousel.container.querySelector(".carousel-track");

  // 애니메이션 없이 원본 위치로 이동
  track.style.transition = "none";
  carousel.currentIndex = carousel.itemsPerView + carousel.realCurrentIndex;

  // 픽셀 기반 정확한 계산
  const itemWidth = 258; // px
  const gap = 8; // px
  const moveDistance = carousel.currentIndex * (itemWidth + gap);

  track.style.transform = `translateX(-${moveDistance}px)`;

  carousel.willSnapToOriginal = false;
}

function updateTrackPosition(carousel, animate = true) {
  const track = carousel.container.querySelector(".carousel-track");

  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition = "transform 0.4s ease-in-out";
  }

  // 픽셀 기반 정확한 계산
  const itemWidth = 258; // px
  const gap = 8; // px
  const moveDistance = carousel.currentIndex * (itemWidth + gap);

  track.style.transform = `translateX(-${moveDistance}px)`;
}

function updateCarouselButtons(carousel) {
  const prevBtn = carousel.container.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.container.querySelector(".carousel-btn.next");

  // 무한 캐러셀에서는 버튼을 항상 활성화
  prevBtn.disabled = false;
  nextBtn.disabled = false;
}

function updateIndicator(carousel) {
  const indicator = carousel.container.querySelector(".carousel-indicator");
  if (!indicator) return;

  const dots = indicator.querySelectorAll(".dot");
  const totalItems = carousel.totalOriginalItems;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  let possiblePositions = [];
  for (let i = 0; i <= maxIndex; i += carousel.stepSize) {
    possiblePositions.push(i);
  }

  if (possiblePositions[possiblePositions.length - 1] < maxIndex) {
    possiblePositions.push(maxIndex);
  }

  // 현재 실제 인덱스를 기준으로 페이지 계산
  let adjustedIndex = carousel.realCurrentIndex;

  // stepSize 단위로 정렬된 인덱스 찾기
  let currentPage = 0;
  for (let i = 0; i < possiblePositions.length; i++) {
    if (adjustedIndex >= possiblePositions[i]) {
      currentPage = i;
    } else {
      break;
    }
  }

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPage);
  });
}

export { initCarousel };
