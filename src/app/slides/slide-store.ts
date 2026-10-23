import type { SlidesRepository } from '../../domain/repository';
import type { Slide } from '../../domain/slide';
import type { Clock } from '../clock';
import { startDaily } from '../refresh/lifecycle';

export const SLIDES_RELOAD_MS = 5 * 60_000;

export interface SlideStore {
  getSnapshot(): Slide[];
  subscribe(listener: () => void): () => void;
  start(): void;
  stop(): void;
}

export interface SlideStoreOptions {
  reloadMs?: number;
  /** Full page reload once a day (same as the TV) to avoid memory leaks on an always-on tablet. */
  dailyReload?: { clock: Clock; at: string; reload: () => void };
}

/** Loads the active slides at start and every 5 min; keeps the last list if Sanity fails. */
export const createSlideStore = (
  manual: SlidesRepository,
  { reloadMs = SLIDES_RELOAD_MS, dailyReload }: SlideStoreOptions = {},
): SlideStore => {
  let slides: Slide[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopDaily: (() => void) | null = null;
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
      if (dailyReload) stopDaily = startDaily(dailyReload.clock, dailyReload.at, dailyReload.reload);
    },
    stop() {
      if (timer !== null) clearInterval(timer);
      timer = null;
      stopDaily?.();
      stopDaily = null;
    },
  };
};
