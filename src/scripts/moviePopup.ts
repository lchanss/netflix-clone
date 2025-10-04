let currentPopup: HTMLElement | null = null;

// 로컬스토리지에서 좋아요 상태 관리
function getLikedStatus(movieId: string): boolean {
  const likedMovies = JSON.parse(localStorage.getItem("likedMovies") || "{}");
  return likedMovies[movieId] || false;
}

function setLikedStatus(movieId: string, liked: boolean): void {
  const likedMovies = JSON.parse(localStorage.getItem("likedMovies") || "{}");
  likedMovies[movieId] = liked;
  localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
}

function toggleLike(movieId: string): boolean {
  const currentStatus = getLikedStatus(movieId);
  const newStatus = !currentStatus;
  setLikedStatus(movieId, newStatus);
  return newStatus;
}

// 좋아요 버튼 클릭 이벤트 핸들러
function handleLikeButtonClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  const button = event.currentTarget as HTMLButtonElement;
  const movieId = button.dataset.movieId;

  if (!movieId) return;

  const newLikedStatus = toggleLike(movieId);

  // 아이콘 업데이트
  const img = button.querySelector("img");
  if (img) {
    img.src = newLikedStatus
      ? "/icons/thumb_up_filled_icon.svg"
      : "/icons/thumb_up_icon.svg";
  }
}

// 팝업 HTML 생성 함수
function createMoviePopupHTML(
  movieId: string,
  title: string,
  imageUrl: string
): string {
  const isLiked = getLikedStatus(movieId);
  const iconSrc = isLiked
    ? "/icons/thumb_up_filled_icon.svg"
    : "/icons/thumb_up_icon.svg";

  return `
    <div class="movie-detail-popup-overlay" data-movie-id="${movieId}">
      <div class="movie-detail-popup">
        <div class="popup-content">
          <div class="popup-image">
            <img src="${imageUrl}" alt="영화 포스터" />
          </div>
          <div class="popup-info">
            <h3 class="movie-title">${title}</h3>
            <div class="popup-controls">
              <button class="like-btn" data-movie-id="${movieId}">
                <img src="${iconSrc}" alt="좋아요" width="20" height="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 팝업 표시
function showMoviePopup(
  movieId: string,
  title: string,
  imageUrl: string,
  carouselItem: HTMLElement
) {
  // 기존 팝업 제거
  hideMoviePopup();

  // 새 팝업 생성
  const popupHTML = createMoviePopupHTML(movieId, title, imageUrl);
  const popupElement = document.createElement("div");
  popupElement.innerHTML = popupHTML;
  currentPopup = popupElement.firstElementChild as HTMLElement;

  // body에 추가
  document.body.appendChild(currentPopup);

  // 캐러셀 아이템 위치 계산
  const rect = carouselItem.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 팝업 위치 설정
  const popup = currentPopup.querySelector(
    ".movie-detail-popup"
  ) as HTMLElement;
  popup.style.position = "fixed";
  popup.style.left = `${centerX}px`;
  popup.style.top = `${centerY}px`;
  popup.style.transform = "translate(-50%, -50%) scale(0)";
  popup.style.zIndex = "10000";

  // 좋아요 버튼 이벤트 리스너 추가
  const likeBtn = popup.querySelector(".like-btn") as HTMLButtonElement;
  if (likeBtn) {
    likeBtn.addEventListener("click", handleLikeButtonClick);
  }

  // 애니메이션으로 표시
  requestAnimationFrame(() => {
    popup.style.transform = "translate(-50%, -50%) scale(1)";
  });
}

// 팝업 숨김
function hideMoviePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

export { showMoviePopup, hideMoviePopup };
