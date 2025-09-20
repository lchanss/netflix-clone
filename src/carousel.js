const carousels = new Map();

function initCarousel() {
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
  carousels.set(id, {
    currentIndex: 0,
    itemsPerView: 6,
    container: container,
  });
  updateCarouselButtons(carousels.get(id));
  return id;
}

function createIndicator(container) {
  const carousel = carousels.get(container.dataset.carousel);
  const items = container.querySelectorAll(".carousel-item");
  const indicator = container.querySelector(".carousel-indicator");

  // 인디케이터 개수 = 전체 아이템 - 한번에 보이는 개수 + 1
  const totalIndicators = Math.max(1, items.length - carousel.itemsPerView + 1);

  // 기존 점들 제거
  indicator.innerHTML = "";

  // 새로운 점들 생성
  for (let i = 0; i < totalIndicators; i++) {
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

  // 1개씩 이동
  let newIndex = carousel.currentIndex + direction;

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

  // currentIndex가 바로 현재 활성화되어야 할 인디케이터 번호
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === carousel.currentIndex);
  });
}

export { initCarousel };
