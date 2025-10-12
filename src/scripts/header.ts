function initHeader() {
  // 스크롤 이벤트로 헤더 배경 변경
  window.addEventListener("scroll", () => {
    const header = document.querySelector<HTMLElement>(".main-header");
    if (window.scrollY > 50) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // 프로필 버튼 아이콘 회전 효과를 위한 transition 설정
  const profileButtonIcon = document.querySelector<HTMLImageElement>(
    ".profile-button-icon"
  );
  if (profileButtonIcon) {
    profileButtonIcon.style.transition = "transform 0.2s ease";
  }
}

function initSearch() {
  const searchToggleLabel = document.querySelector<HTMLLabelElement>(
    ".search-toggle-label"
  );
  const searchInputWrapper = document.querySelector<HTMLDivElement>(
    ".search-input-wrapper"
  );
  const searchInput = document.querySelector<HTMLInputElement>(".search-input");
  const searchClearButton = document.querySelector<HTMLButtonElement>(
    ".search-clear-button"
  );

  if (
    !searchToggleLabel ||
    !searchInputWrapper ||
    !searchInput ||
    !searchClearButton
  ) {
    return;
  }

  // label 클릭 시 input wrapper 활성화
  searchToggleLabel.addEventListener("click", () => {
    searchInputWrapper.classList.add("active");
    searchInput.focus();
  });

  // 검색어 입력 시
  searchInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // X 버튼 표시/숨김
    if (value) {
      searchClearButton.classList.add("visible");
      // URL 변경하여 검색 페이지로 이동
      window.location.href = `/search.html?query=${encodeURIComponent(value)}`;
    } else {
      searchClearButton.classList.remove("visible");
      // 검색어 없으면 홈으로
      window.location.href = "/";
    }
  });

  // X 버튼 클릭 시
  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchClearButton.classList.remove("visible");
    window.location.href = "/";
  });
}

export { initHeader, initSearch };
