export interface CarouselData {
  title: string;
  itemsPerView: number;
  stepSize: number;
  items: string[];
}

export interface Carousel {
  currentIndex: number;
  realCurrentIndex: number;
  itemsPerView: number;
  stepSize: number;
  container: HTMLElement;
  totalOriginalItems: number;
  isTransitioning: boolean;
  willSnapToOriginal?: boolean;
}
