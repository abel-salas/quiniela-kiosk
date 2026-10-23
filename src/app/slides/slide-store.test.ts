import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DAILY_MARGIN_MS } from '../refresh/lifecycle';
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

  it('reloads the page every day at the configured time', async () => {
    vi.setSystemTime(new Date(2026, 9, 20, 22, 0));
    const reload = vi.fn();
    const store = createSlideStore({ getSlides: async () => [] }, {
      dailyReload: { clock: { now: () => new Date() }, at: '05:00', reload },
    });
    store.start();
    await vi.advanceTimersByTimeAsync(7 * 3_600_000);
    expect(reload).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(DAILY_MARGIN_MS);
    expect(reload).toHaveBeenCalledTimes(1);

    store.stop();
    await vi.advanceTimersByTimeAsync(48 * 3_600_000);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
