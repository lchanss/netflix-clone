# 검색창 기능 설계서

## 1. 개요

Netflix 스타일의 검색 기능을 Vanilla TypeScript로 구현합니다. 사용자가 돋보기 버튼을 클릭하면 검색창이 나타나고, 입력한 검색어로 영화를 실시간으로 검색할 수 있습니다.

---

## 2. 파일 구조

```
project/
├── src/
│   ├── scripts/
│   │   ├── header.ts (수정)
│   │   ├── search.ts (신규)
│   │   └── searchPage.ts (신규)
│   ├── styles/
│   │   └── search.css (신규)
│   ├── types.ts (수정)
│   └── main.ts (수정)
├── server/
│   ├── index.js (신규)
│   └── data.js (신규)
├── index.html (수정)
└── search.html (신규)
```

---

## 3. 데이터 타입 정의

### Movie 타입

```
id: number
title: string
imageUrl: string
```

### SearchResponse 타입

```
movies: Movie[]
```

---

## 4. 전체 로직 흐름

### 4.1 검색 시작 (홈 페이지에서)

```
[사용자] 돋보기 버튼 클릭
    ↓
[UI] 검색 input wrapper의 width가 0 → 300px로 확장 (transition 0.3s)
    ↓
[UI] input에 자동 focus
    ↓
[사용자] 검색어 입력 (예: "센")
    ↓
[이벤트] input의 'input' 이벤트 발생
    ↓
[로직] e.target.value 읽기
    ↓
[분기]
├─ value가 있는 경우
│   ├─ X 버튼 표시
│   └─ window.location.href = `/search.html?query=${value}` 실행
└─ value가 없는 경우
    ├─ X 버튼 숨김
    └─ window.location.href = `/` 실행
```

### 4.2 검색 결과 표시 (search.html 페이지)

```
[페이지 로드] search.html
    ↓
[초기화] initSearchPage() 실행
    ↓
[로직] URLSearchParams로 현재 URL 파싱
    ↓
[로직] 'query' 파라미터 읽기
    ↓
[분기]
├─ query가 없는 경우
│   └─ window.location.href = `/` 실행 (홈으로 리다이렉트)
└─ query가 있는 경우
    ↓
    [API] searchMovies(query) 함수 호출
        ↓
        [HTTP] GET http://localhost:3001/api/search?query={query}
        ↓
        [백엔드] Express 서버에서 요청 수신
        ↓
        [백엔드] MOVIES 배열에서 title.includes(query) 필터링 (대소문자 무시)
        ↓
        [백엔드] { movies: Movie[] } 응답
        ↓
    [프론트] 응답 데이터 수신
    ↓
    [분기]
    ├─ movies.length === 0
    │   └─ "검색 결과가 없습니다" 메시지 표시
    └─ movies.length > 0
        └─ renderSearchResults(movies) 실행
            ↓
            [렌더링] Grid 레이아웃으로 영화 카드 생성 및 DOM 추가
```

### 4.3 검색어 초기화 (X 버튼)

```
[사용자] X 버튼 클릭
    ↓
[로직] input.value = '' 설정
    ↓
[UI] X 버튼 숨김
    ↓
[로직] window.location.href = `/` 실행
```

---

## 5. 컴포넌트별 상세 로직

### 5.1 Header 검색 UI (header.ts의 initSearch)

**역할**: 검색창 토글, 입력 처리, 페이지 이동

**초기화 로직**

1. DOM 요소 선택

   - `.search-toggle-button` (돋보기 버튼)
   - `.search-input-wrapper` (input 감싸는 컨테이너)
   - `.search-input` (검색 input)
   - `.search-clear-button` (X 버튼)

2. 이벤트 리스너 등록

**돋보기 버튼 클릭 이벤트**

```
클릭 발생
    ↓
searchInputWrapper에 'active' 클래스 추가
    ↓
searchInput.focus() 실행
```

**Input 입력 이벤트**

```
input 이벤트 발생
    ↓
e.target.value 읽기
    ↓
value가 있는가?
├─ YES
│   ├─ searchClearButton에 'visible' 클래스 추가
│   └─ window.location.href = `/search.html?query=${encodeURIComponent(value)}`
└─ NO
    ├─ searchClearButton에서 'visible' 클래스 제거
    └─ window.location.href = `/`
```

**X 버튼 클릭 이벤트**

```
클릭 발생
    ↓
searchInput.value = ''
    ↓
searchClearButton에서 'visible' 클래스 제거
    ↓
window.location.href = `/`
```

---

### 5.2 검색 API 모듈 (search.ts)

**함수**: `searchMovies(query: string): Promise<SearchResponse>`

**로직 흐름**

```
함수 호출 (query 전달)
    ↓
query가 빈 문자열인가?
├─ YES → { movies: [] } 반환
└─ NO
    ↓
    try 블록 시작
        ↓
        fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(query)}`)
        ↓
        response.ok 확인
        ├─ NO → Error throw
        └─ YES
            ↓
            response.json() 파싱
            ↓
            SearchResponse 타입으로 반환
    ↓
    catch 블록 (에러 발생 시)
        ↓
        console.error로 에러 로깅
        ↓
        { movies: [] } 반환
```

---

### 5.3 검색 페이지 (searchPage.ts)

**함수 1**: `initSearchPage()`

**로직 흐름**

```
함수 실행
    ↓
URLSearchParams로 window.location.search 파싱
    ↓
urlParams.get('query') 실행
    ↓
query가 null인가?
├─ YES → window.location.href = `/` 실행 후 종료
└─ NO
    ↓
    DOM 요소 선택
    - .search-results-title (제목 영역)
    - .search-results-grid (결과 그리드)
    ↓
    resultsTitle.textContent = `"${query}" 검색 결과` 설정
    ↓
    searchMovies(query) 호출 (await)
    ↓
    { movies } 구조분해
    ↓
    movies.length === 0 인가?
    ├─ YES → resultsGrid.innerHTML = '검색 결과가 없습니다' 설정
    └─ NO → renderSearchResults(movies, resultsGrid) 호출
```

**함수 2**: `renderSearchResults(movies: Movie[], container: HTMLDivElement)`

**로직 흐름**

```
함수 실행
    ↓
container.innerHTML = '' (초기화)
    ↓
movies 배열 순회 (forEach)
    ↓
    각 movie에 대해:
        ↓
        div.search-result-item 요소 생성
        ↓
        innerHTML 설정:
        - img (movie.imageUrl, movie.title)
        - p.title (movie.title)
        ↓
        container에 appendChild
    ↓
순회 완료
```

---

### 5.4 메인 초기화 (main.ts)

**initApp 함수 수정**

**로직 흐름**

```
DOMContentLoaded 이벤트 발생
    ↓
initApp() 실행
    ↓
[개발 환경] MSW worker 시작 (if import.meta.env.DEV)
    ↓
initHeader() 실행
    ↓
initSearch() 실행
    ↓
현재 페이지 경로 확인 (window.location.pathname)
    ↓
경로가 '/search.html'인가?
├─ YES
│   └─ initSearchPage() 동적 import 후 실행
└─ NO
    └─ initCarousel() 실행
```

---

## 6. 백엔드 로직 (Express 서버)

### 6.1 서버 초기화 (server/index.js)

**로직 흐름**

```
서버 파일 실행
    ↓
express 인스턴스 생성
    ↓
미들웨어 등록
- cors() (CORS 허용)
- express.json() (JSON 파싱)
    ↓
라우트 등록
    ↓
app.listen(3001) 실행
    ↓
서버 대기 상태
```

### 6.2 검색 API 엔드포인트 (GET /api/search)

**로직 흐름**

```
GET /api/search 요청 수신
    ↓
req.query.query 읽기
    ↓
query가 undefined 또는 null인가?
├─ YES → { movies: [] } 응답 후 종료
└─ NO
    ↓
    query를 소문자로 변환 (toLowerCase)
    ↓
    MOVIES 배열에 filter 적용
        ↓
        각 movie에 대해:
        - movie.title.toLowerCase() 실행
        - query가 포함되어 있는지 확인 (includes)
        - true이면 결과 배열에 포함
    ↓
    filteredMovies 배열 생성
    ↓
    { movies: filteredMovies } 응답
```

---

## 7. UI 상태 관리

### 7.1 검색 Input Wrapper 상태

**CSS 클래스로 상태 관리**

**기본 상태**

```
.search-input-wrapper
- width: 0
- overflow: hidden
```

**활성 상태** (`.active` 클래스 추가 시)

```
.search-input-wrapper.active
- width: 300px
- transition으로 애니메이션 적용
```

### 7.2 X 버튼 표시/숨김

**기본 상태**

```
.search-clear-button
- display: none
```

**표시 상태** (`.visible` 클래스 추가 시)

```
.search-clear-button.visible
- display: flex
```

---

## 8. 페이지 라우팅 구조

### 8.1 홈 페이지 (/)

- 캐러셀 표시
- 헤더에 검색 UI 존재

### 8.2 검색 페이지 (/search.html?query={검색어})

- URL에서 query 파라미터 읽기
- API 호출
- 검색 결과 Grid 표시

### 8.3 페이지 간 이동

```
input에 글자 입력
    ↓
window.location.href 변경
    ↓
전체 페이지 리로드
    ↓
새 페이지에서 initApp() 재실행
```

---

## 9. 에러 처리 전략

### 9.1 프론트엔드

**API 요청 실패**

```
fetch 실패 (네트워크 오류, 서버 오류 등)
    ↓
catch 블록에서 에러 캐치
    ↓
console.error로 로깅
    ↓
{ movies: [] } 반환
    ↓
"검색 결과가 없습니다" 메시지 표시
```

**query 파라미터 없음**

```
URLSearchParams.get('query') === null
    ↓
홈 페이지(/)로 리다이렉트
```

### 9.2 백엔드

**query 파라미터 없음**

```
req.query.query가 undefined
    ↓
{ movies: [] } 응답
```

**검색 결과 없음**

```
filter 결과가 빈 배열
    ↓
{ movies: [] } 응답 (정상 응답)
```

---

## 10. 구현 순서

1. **타입 정의**: types.ts에 Movie, SearchResponse 추가
2. **HTML 구조**: index.html에 검색 UI 추가, search.html 생성
3. **CSS 스타일**: search.css 생성 (애니메이션, Grid 레이아웃)
4. **헤더 검색 로직**: header.ts에 initSearch 함수 구현
5. **검색 API 모듈**: search.ts 구현
6. **검색 페이지 로직**: searchPage.ts 구현
7. **main.ts 라우팅**: 페이지별 초기화 로직 추가
8. **백엔드 데이터**: server/data.js에 더미 영화 데이터 작성
9. **백엔드 서버**: server/index.js에 Express 서버 구현
10. **통합 테스트**: 전체 흐름 동작 확인
