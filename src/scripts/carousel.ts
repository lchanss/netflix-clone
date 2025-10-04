import type { Carousel, CarouselData, CarouselItem } from "../types.ts";
import { hideMoviePopup, showMoviePopup } from "./moviePopup.ts";

const carousels = new Map<string, Carousel>();

const ITEMES_PREVIEW_DEFAULT = 6;
const STEP_SIZE_DEFAULT = 1;
const NAVIGATE_BUTTON_CONFIGS = [
  {
    buttonClass: "prev",
    direction: -1,
    imgSrc: "/icons/arrow_left_icon.svg",
    alt: "이전",
  },
  {
    buttonClass: "next",
    direction: 1,
    imgSrc: "/icons/arrow_right_icon.svg",
    alt: "다음",
  },
];

// ===== Public API =====

export async function initCarousel() {
  try {
    // 먼저 캐러셀들 렌더링
    await renderCarousels();
    const containers = document.querySelectorAll<HTMLDivElement>(
      ".carousel-container"
    );
    containers.forEach(initCarouselContainer);
  } catch (error) {
    console.error("캐러셀 초기화 실패:", error);
  }
}

// ===== Initialization =====

// 모든 캐러셀 렌더링
async function renderCarousels() {
  const catalog = document.querySelector(`.catalog`);
  if (!catalog) {
    console.error(`Container with class 'catalog' not found`);
    return;
  }

  catalog.innerHTML = '<div class="loading">데이터를 불러오는 중...</div>';

  try {
    const carouselsData = await fetchCarouselsData();

    // 데이터가 비어있는지 확인
    if (carouselsData.length === 0) {
      catalog.innerHTML =
        '<div class="error">데이터를 불러올 수 없습니다.</div>';
      return;
    }

    // 캐러셀 HTML 생성
    const carouselsHTML = carouselsData
      .map((data) => createCarouselHTML(data))
      .join("");

    catalog.innerHTML = carouselsHTML;
  } catch (error) {
    console.error("캐러셀 렌더링 실패:", error);
    catalog.innerHTML = '<div class="error">캐러셀을 표시할 수 없습니다.</div>';
  }
}

function initCarouselContainer(container: HTMLDivElement) {
  const carouselId = setupCarousel(container);
  createIndicator(container);
  setupCarouselButtons(container, carouselId);
  setupCarouselItemEvents(container);
}

function setupCarousel(container: HTMLDivElement) {
  const id = container.dataset.carousel || Math.random().toString(36);

  // HTML에서 설정값 읽기 (기본값 설정)
  const itemsPerView = parseInt(
    container.dataset.itemsPerView ?? ITEMES_PREVIEW_DEFAULT.toString()
  );
  let stepSize = parseInt(
    container.dataset.stepSize ?? STEP_SIZE_DEFAULT.toString()
  );

  // 검증: stepSize가 itemsPerView보다 클 수 없음
  if (stepSize > itemsPerView) {
    console.warn(
      `stepSize(${stepSize})가 itemsPerView(${itemsPerView})보다 클 수 없습니다. stepSize를 ${itemsPerView}로 조정합니다.`
    );
    stepSize = itemsPerView;
  }

  // 무한 캐러셀을 위한 복제 아이템 생성
  createClonedItems(container, itemsPerView);

  const track = container.querySelector<HTMLDivElement>(".carousel-track");
  const totalOriginalItems =
    track?.querySelectorAll<HTMLDivElement>(".carousel-item:not(.clone)")
      .length ?? 0;

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

  if (!carousel) {
    throw new Error("캐러셀 초기화 실패");
  }

  carousel.currentIndex = itemsPerView;
  updateTrackPosition(carousel, false); // 애니메이션 없이 초기 위치 설정
  updateCarouselButtons(carousel);

  return id;
}

function createIndicator(container: HTMLDivElement) {
  const carouselId = container.dataset.carousel ?? "";
  const carousel = carousels.get(carouselId);
  if (!carousel) return;

  const originalItems = container.querySelectorAll<HTMLDivElement>(
    ".carousel-item:not(.clone)"
  );
  const indicator = container.querySelector<HTMLDivElement>(
    ".carousel-indicator"
  );

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
    indicator?.appendChild(dot);
  }
}

function setupCarouselButtons(container: HTMLDivElement, carouselId: string) {
  const buttons =
    container.querySelectorAll<HTMLButtonElement>(".carousel-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", handleCarouselButtonClick(carouselId));
  });
}

// ===== HTML Builders =====

// 캐러셀 HTML 생성
function createCarouselHTML(carouselData: CarouselData) {
  const { id, title, itemsPerView, stepSize, items } = carouselData;

  const carouselItemsHTML = items
    .map((item) => createCarouselItem(item))
    .join("");

  const carouselNavigateButtonsHTML = NAVIGATE_BUTTON_CONFIGS.map((config) =>
    createCarouselNavigateButton(config)
  ).join("");

  const carouselContainerHTML = createCarouselContainer(
    id,
    itemsPerView,
    stepSize,
    carouselItemsHTML,
    carouselNavigateButtonsHTML
  );

  return createCarouselSection(title, carouselContainerHTML);
}

function createCarouselSection(title: string, carouselContainerHtml: string) {
  return `
    <section class="content-row">
      <h2 class="content-title">${title}</h2>
      ${carouselContainerHtml}
    </section>
  `;
}

function createCarouselContainer(
  carouselId: number,
  itemsPerView: number,
  stepSize: number,
  carouselItemsHTML: string,
  carouselNavigateButtonsHTML: string
) {
  return `
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
      ${carouselNavigateButtonsHTML}
    </div>
  `;
}

// TODO: data-movie-index 말고 id로 바꾸기
function createCarouselItem(item: CarouselItem) {
  const { id, imageUrl } = item;

  return `
    <div class="carousel-item" data-movie-index="${id}">
      <img src="${imageUrl}" alt="영화썸네일 ${id}" width="100%" />
    </div>
  `;
}

function createCarouselNavigateButton(config: {
  buttonClass: string;
  direction: number;
  imgSrc: string;
  alt: string;
}): string {
  const { buttonClass, direction, imgSrc, alt } = config;

  return `
    <button class="${buttonClass}" data-direction="${direction}">
      <img src="${imgSrc}" alt="${alt}" width="64px" />
    </button>`;
}

// ===== Event Handlers =====

// 캐러셀 아이템 이벤트 설정
function setupCarouselItemEvents(container: HTMLDivElement) {
  const items = container.querySelectorAll<HTMLDivElement>(".carousel-item");

  items.forEach((item, index) => {
    const movieId = `movie_${index + 1}`;
    const img = item.querySelector("img");
    if (!img) return;

    let hoverTimeout: number;

    // item.addEventListener("mouseenter", () => {
    //   hoverTimeout = window.setTimeout(() => {
    //     showMoviePopup(
    //       movieId,
    //       `영화 제목 ${index + 1}`,
    //       "/images/placeholder.png",
    //       item
    //     );
    //   }, 300); // 300ms 딜레이
    // });

    // item.addEventListener("mouseleave", () => {
    //   clearTimeout(hoverTimeout);
    //   hideMoviePopup();
    // });
  });
}

function handleCarouselButtonClick(carouselId: string) {
  return ({ currentTarget }: Event) => {
    const direction = parseInt(
      (currentTarget as HTMLButtonElement).dataset.direction || "0"
    );
    moveCarousel(carouselId, direction);
  };
}

function moveCarousel(carouselId: string, direction: number) {
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
  }, 400);

  updateCarouselButtons(carousel);
  updateIndicator(carousel);
}

// ===== DOM Utilities =====

// 무한 스크롤을 위한 복제 아이템 생성
function createClonedItems(container: HTMLDivElement, itemsPerView: number) {
  const track = container.querySelector<HTMLDivElement>(".carousel-track");
  const items = Array.from(
    track?.querySelectorAll<HTMLDivElement>(".carousel-item") ?? []
  );

  const frontItems = items.slice(-itemsPerView); // 마지막 itemsPerView개
  const backItems = items.slice(0, itemsPerView); // 첫 번째 itemsPerView개

  // Fragment 생성
  const frontFragment = createCloneFragment(frontItems);
  const backFragment = createCloneFragment(backItems);

  // 한 번에 DOM에 추가
  track?.insertBefore(frontFragment, track.firstChild);
  track?.appendChild(backFragment);
}

// 아이템들을 복제하여 Fragment로 반환하는 헬퍼 함수
function createCloneFragment(items: HTMLDivElement[]): DocumentFragment {
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const clone = item.cloneNode(true) as HTMLDivElement;
    clone.classList.add("clone");
    fragment.appendChild(clone);
  });

  return fragment;
}

// ===== Position & Animation =====

// track의 위치와 애니메이션을 설정하는 공통 함수
function setTrackPosition(
  track: HTMLDivElement,
  currentIndex: number,
  animate: boolean = true
) {
  const itemWidth = 258; // px
  const gap = 8; // px
  const moveDistance = currentIndex * (itemWidth + gap);

  // 애니메이션 설정
  track.style.transition = animate ? "transform 0.4s ease-in-out" : "none";

  // 위치 설정
  track.style.transform = `translateX(-${moveDistance}px)`;
}

function updateTrackPosition(carousel: Carousel, animate = true) {
  const track =
    carousel.container.querySelector<HTMLDivElement>(".carousel-track");
  if (!track) return;

  setTrackPosition(track, carousel.currentIndex, animate);
}

// 애니메이션 후 원본 위치로 몰래 이동
function snapToOriginalPosition(carousel: Carousel) {
  const track =
    carousel.container.querySelector<HTMLDivElement>(".carousel-track");
  if (!track) return;

  // 원본 위치 계산 후 애니메이션 없이 이동
  carousel.currentIndex = carousel.itemsPerView + carousel.realCurrentIndex;
  setTrackPosition(track, carousel.currentIndex, false);

  carousel.willSnapToOriginal = false;
}

// ===== UI Updates =====

function updateCarouselButtons(carousel: Carousel) {
  const prevBtn =
    carousel.container.querySelector<HTMLButtonElement>(".carousel-btn.prev");
  const nextBtn =
    carousel.container.querySelector<HTMLButtonElement>(".carousel-btn.next");

  if (!prevBtn || !nextBtn) return;

  // 무한 캐러셀에서는 버튼을 항상 활성화
  enableButton(prevBtn);
  enableButton(nextBtn);
}

function updateIndicator(carousel: Carousel) {
  const indicator = carousel.container.querySelector<HTMLDivElement>(
    ".carousel-indicator"
  );
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

// 버튼 활성화 함수
function enableButton(button: HTMLButtonElement) {
  button.disabled = false;
}

// ===== Data Fetching =====

async function fetchCarouselsData(): Promise<CarouselData[]> {
  try {
    const response = await fetch("/api/carousels");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("캐러셀 데이터 fetch 실패:", error);
    return [];
  }
}
