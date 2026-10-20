import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { nextSlideIndex, reconcileSlideIndex, selectSlideViews, SLIDE_INTERVAL_MS, type SlideView } from '../selectors/slides';
import type { SlideStore } from './slide-store';

export const SlideStoreContext = createContext<SlideStore | null>(null);

export const useSlides = (): SlideView[] => {
  const store = useContext(SlideStoreContext);
  if (!store) throw new Error('useSlides requires a SlideStoreContext provider');
  const slides = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return useMemo(() => selectSlideViews(slides), [slides]);
};

/** Index of the visible slide: advances every 10 s and keeps the same slide across list reloads. */
export const useSlideRotation = (slides: SlideView[], intervalMs = SLIDE_INTERVAL_MS): number => {
  const [state, setState] = useState({ slides, index: 0 });
  let current = state;
  if (state.slides !== slides) {
    // Derived state from the previous render (React pattern): no extra effect needed.
    current = { slides, index: reconcileSlideIndex(state.slides, slides, state.index) };
    setState(current);
  }

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setState((previous) => ({ ...previous, index: nextSlideIndex(previous.index, previous.slides.length) }));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides, intervalMs]);

  return current.index;
};
