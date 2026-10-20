import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Slide } from '../../domain/slide';
import { createSlideStore, SLIDES_RELOAD_MS } from './slide-store';

const slide = (id: string): Slide => ({ id, title: null, imageUrl: `/${id}.jpg`, order: 1 });

describe('createSlideStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('loads at start and every 5 minutes, notifying listeners', async () => {
    const getSlides = vi.fn<() => Promise<Slide[]>>()
      .mockResolvedValueOnce([slide('a')])
      .mockResolvedValueOnce([slide('a'), slide('b')]);
    const store = createSlideStore({ getSlides });
    const listener = vi.fn();
    store.subscribe(listener);

    store.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getSnapshot().map((s) => s.id)).toEqual(['a']);

    await vi.advanceTimersByTimeAsync(SLIDES_RELOAD_MS);
    expect(store.getSnapshot().map((s) => s.id)).toEqual(['a', 'b']);
    expect(listener).toHaveBeenCalledTimes(2);
    store.stop();
  });

  it('keeps the last list when Sanity fails and stops reloading on stop', async () => {
    const getSlides = vi.fn<() => Promise<Slide[]>>()
      .mockResolvedValueOnce([slide('a')])
      .mockRejectedValueOnce(new Error('offline'));
    const store = createSlideStore({ getSlides });

    store.start();
    await vi.advanceTimersByTimeAsync(SLIDES_RELOAD_MS);
    expect(store.getSnapshot().map((s) => s.id)).toEqual(['a']);

    store.stop();
    await vi.advanceTimersByTimeAsync(3 * SLIDES_RELOAD_MS);
    expect(getSlides).toHaveBeenCalledTimes(2);
  });
});
