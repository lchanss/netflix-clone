import { debounce } from "../utils/debounce";

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
  const searchWrapper =
    document.querySelector<HTMLDivElement>(".search-wrapper");
  const searchInput = document.querySelector<HTMLInputElement>(".search-input");
  const searchClearButton = document.querySelector<HTMLButtonElement>(
    ".search-clear-button"
  );

  if (
    !searchToggleLabel ||
    !searchWrapper ||
    !searchInput ||
    !searchClearButton
  ) {
    return;
  }

  // 검색 페이지인 경우 URL에서 검색어 읽어서 초기화
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");
  if (query) {
    searchWrapper.classList.add("active");
    searchInput.value = query;
    searchClearButton.classList.add("visible");
  }

  // label 클릭 시 input wrapper 활성화
  searchToggleLabel.addEventListener("click", () => {
    searchWrapper.classList.add("active");
    searchInput.focus();
  });

  // 검색어 입력 시 (debounce 적용)
  const handleSearchInput = debounce((value: string) => {
    if (value) {
      window.location.href = `/search?query=${encodeURIComponent(value)}`;
    } else {
      window.location.href = "/";
    }
  }, 500);

  searchInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // X 버튼 표시/숨김
    if (value) {
      searchClearButton.classList.add("visible");
    } else {
      searchClearButton.classList.remove("visible");
    }

    // debounce 적용된 검색 실행
    handleSearchInput(value);
  });

  // X 버튼 클릭 시
  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchClearButton.classList.remove("visible");
    window.location.href = "/";
  });
}

export { initHeader, initSearch };
