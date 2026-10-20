import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequestQueue } from './queue';

describe('createRequestQueue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs at most 2 tasks at once and spaces starts by 500 ms', async () => {
    const queue = createRequestQueue({ concurrency: 2, spacingMs: 500 });
    const starts: number[] = [];
    let active = 0;
    let maxActive = 0;
    const task = () => {
      starts.push(Date.now());
      active += 1;
      maxActive = Math.max(maxActive, active);
      return new Promise<void>((resolve) => setTimeout(() => {
        active -= 1;
        resolve();
      }, 2_000));
    };
    const t0 = Date.now();
    const all = Promise.all([1, 2, 3, 4].map(() => queue.run(task)));

    await vi.advanceTimersByTimeAsync(10_000);
    await all;
    expect(maxActive).toBe(2);
    expect(starts.map((start) => start - t0)).toEqual([0, 500, 2_000, 2_500]);
  });

  it('propagates task errors and keeps processing', async () => {
    const queue = createRequestQueue({ spacingMs: 0 });
    await expect(queue.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    await expect(queue.run(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });
});
