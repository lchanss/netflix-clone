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

export { initHeader };
