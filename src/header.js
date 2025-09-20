window.addEventListener("scroll", () => {
  const header = document.querySelector(".main-header");
  if (window.scrollY > 50) {
    // 50px 이상 스크롤하면
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
