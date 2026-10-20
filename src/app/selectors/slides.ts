import type { Slide } from '../../domain/slide';

export const SLIDE_INTERVAL_MS = 10_000;
export const SLIDE_IMAGE_PARAMS = 'w=2048&fit=max';

export interface SlideView {
  key: string;
  imageUrl: string;
  alt: string;
}

const withImageParams = (url: string): string =>
  `${url}${url.includes('?') ? '&' : '?'}${SLIDE_IMAGE_PARAMS}`;

/** Slides in Sanity order with the asset URL sized for the tablet. */
export const selectSlideViews = (slides: Slide[]): SlideView[] =>
  [...slides]
    .sort((a, b) => a.order - b.order)
    .map((slide) => ({ key: slide.id, imageUrl: withImageParams(slide.imageUrl), alt: slide.title ?? '' }));

export const nextSlideIndex = (index: number, count: number): number => (count === 0 ? 0 : (index + 1) % count);

/** After the list is reloaded, keep showing the same slide if it still exists. */
export const reconcileSlideIndex = (previous: SlideView[], next: SlideView[], index: number): number => {
  const currentKey = previous[index]?.key;
  const kept = next.findIndex((slide) => slide.key === currentKey);
  if (kept >= 0) return kept;
  return next.length === 0 ? 0 : Math.min(index, next.length - 1);
};
