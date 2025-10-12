export type CarouselData = {
  id: string;
  title: string;
  itemsPerView: number;
  stepSize: number;
  items: CarouselItem[];
};

export type Carousel = {
  currentIndex: number;
  realCurrentIndex: number;
  itemsPerView: number;
  stepSize: number;
  container: HTMLElement;
  originalItemsCount: number;
  isTransitioning: boolean;
  willSnapToOriginal?: boolean;
};

export type CarouselItem = {
  id: number;
  imageUrl: string;
};

export type Movie = {
  id: number;
  title: string;
  imageUrl: string;
};

export type GetSearchMoviesResponse = { movies: Movie[] };
