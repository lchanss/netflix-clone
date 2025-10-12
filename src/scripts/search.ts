import type { GetSearchMoviesResponse } from "../types";

const API_BASE_URL = "http://localhost:3001";

export async function searchMovies(query: string) {
  // query가 빈 문자열이면 빈 배열 반환
  if (!query || query.trim() === "") {
    return { movies: [] };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("검색 요청 실패");
    }

    const data: GetSearchMoviesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("검색 에러:", error);
    return { movies: [] };
  }
}
