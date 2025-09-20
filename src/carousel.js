// 캐러셀 상태를 맵으로 관리
const carousels = new Map();

// 캐러셀 초기화
function initCarousel(container) {
  const id = container.dataset.carousel || Math.random().toString(36);
  carousels.set(id, {
    currentIndex: 0,
    itemsPerView: 6,
    container: container,
  });
  return id;
}

// 화면 크기에 따른 아이템 개수 조정
function updateItemsPerView() {
  const width = window.innerWidth;
  let itemsPerView = 6;

  if (width <= 600) itemsPerView = 3;
  else if (width <= 900) itemsPerView = 4;
  else if (width <= 1200) itemsPerView = 5;

  carousels.forEach((carousel) => {
    carousel.itemsPerView = itemsPerView;
    updateCarouselButtons(carousel);
  });
}

// 캐러셀 이동
function moveCarousel(carouselId, direction) {
  const carousel = carousels.get(carouselId);
  if (!carousel) return;

  const track = carousel.container.querySelector(".carousel-track");
  const items = track.querySelectorAll(".carousel-item");

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  let newIndex = carousel.currentIndex + direction;

  if (newIndex < 0) newIndex = 0;
  if (newIndex > maxIndex) newIndex = maxIndex;

  carousel.currentIndex = newIndex;

  const moveAmount = -(newIndex * (100 / carousel.itemsPerView));
  track.style.transform = `translateX(${moveAmount}%)`;

  updateCarouselButtons(carousel);
}

// 버튼 상태 업데이트
function updateCarouselButtons(carousel) {
  const prevBtn = carousel.container.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.container.querySelector(".carousel-btn.next");
  const items = carousel.container.querySelectorAll(".carousel-item");

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - carousel.itemsPerView);

  prevBtn.disabled = carousel.currentIndex <= 0;
  nextBtn.disabled = carousel.currentIndex >= maxIndex;
}

// 초기 설정
window.addEventListener("load", () => {
  // 모든 캐러셀 초기화
  document.querySelectorAll(".carousel-container").forEach((container) => {
    const carouselId = initCarousel(container);

    // 각 캐러셀의 버튼에 이벤트 리스너 등록
    container.querySelectorAll(".carousel-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const direction = parseInt(e.currentTarget.dataset.direction);
        moveCarousel(carouselId, direction);
      });
    });
  });

  updateItemsPerView();
});

window.addEventListener("resize", updateItemsPerView);
