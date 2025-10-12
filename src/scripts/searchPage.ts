import { searchMovies } from "./search";
import type { Movie } from "../types";

async function initSearchPage() {
  // URL에서 query 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  // query가 없으면 홈으로 리다이렉트
  if (!query) {
    window.location.href = "/";
    return;
  }

  const resultsTitle = document.querySelector<HTMLHeadingElement>(
    ".search-results-title"
  );
  const resultsGrid = document.querySelector<HTMLDivElement>(
    ".search-results-grid"
  );

  if (!resultsTitle || !resultsGrid) {
    return;
  }

  resultsTitle.textContent = `"${query}" 검색 결과`;

  resultsGrid.innerHTML = '<p class="search-loading">검색 중...</p>';

  const { movies } = await searchMovies(query);

  if (movies.length === 0) {
    resultsGrid.innerHTML =
      '<p class="search-no-results">검색 결과가 없습니다.</p>';
    return;
  }

  renderSearchResults(movies, resultsGrid);
}

function renderSearchResults(movies: Movie[], container: HTMLDivElement) {
  container.innerHTML = "";

  movies.forEach((movie) => {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.innerHTML = `
      <img src="${movie.imageUrl}" alt="${movie.title}" />
      <p class="title">${movie.title}</p>
    `;
    container.appendChild(item);
  });
}

export { initSearchPage };
