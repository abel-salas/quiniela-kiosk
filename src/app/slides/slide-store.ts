import type { ManualRepository } from '../../domain/repository';
import type { Slide } from '../../domain/slide';

export const SLIDES_RELOAD_MS = 5 * 60_000;

export interface SlideStore {
  getSnapshot(): Slide[];
  subscribe(listener: () => void): () => void;
  start(): void;
  stop(): void;
}

/** Loads the active slides at start and every 5 min; keeps the last list if Sanity fails. */
export const createSlideStore = (
  manual: Pick<ManualRepository, 'getSlides'>,
  reloadMs = SLIDES_RELOAD_MS,
): SlideStore => {
  let slides: Slide[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();

  const load = async (): Promise<void> => {
    try {
      slides = await manual.getSlides();
      listeners.forEach((listener) => listener());
    } catch {
      // Keep showing the previous slides.
    }
  };

  return {
    getSnapshot: () => slides,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      if (timer !== null) return;
      void load();
      timer = setInterval(() => void load(), reloadMs);
    },
    stop() {
      if (timer !== null) clearInterval(timer);
      timer = null;
    },
  };
};
