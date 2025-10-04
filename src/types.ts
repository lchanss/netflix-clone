export type CarouselData = {
  id: number;
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
  totalOriginalItems: number;
  isTransitioning: boolean;
  willSnapToOriginal?: boolean;
};

export type CarouselItem = {
  id: number;
  imageUrl: string;
};
