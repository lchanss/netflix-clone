import express from "express";
import cors from "cors";
import { MOVIES } from "./data.js";

const app = express();
const PORT = 3001;

// 미들웨어
app.use(cors()); // CORS 허용
app.use(express.json());

// GET /api/search?query=검색어
app.get("/api/search", async (req, res) => {
  const query = req.query.query;

  // query 파라미터가 없으면 빈 배열 반환
  if (!query) {
    return res.json({ movies: [] });
  }

  // 제목에 검색어가 포함된 영화 필터링 (대소문자 구분 없음)
  const filteredMovies = MOVIES.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  console.log(`🔍 검색어: "${query}" → ${filteredMovies.length}개 결과`);

  // 1초 지연
  await new Promise((resolve) => setTimeout(resolve, 1000));

  res.json({ movies: filteredMovies });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
