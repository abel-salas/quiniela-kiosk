import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withRetries } from './retry';
import { resultsWindow } from './window';

describe('withRetries', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retries at 5 s and 10 s and returns the first success', async () => {
    const task = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValueOnce('ok');
    const result = withRetries(task);

    await vi.advanceTimersByTimeAsync(0);
    expect(task).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(task).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(task).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(task).toHaveBeenCalledTimes(3);
    await expect(result).resolves.toBe('ok');
  });

  it('throws the last error after three failed attempts', async () => {
    const task = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockRejectedValueOnce(new Error('third'));
    const result = withRetries(task);
    const assertion = expect(result).rejects.toThrow('third');

    await vi.advanceTimersByTimeAsync(15_000);
    await assertion;
    expect(task).toHaveBeenCalledTimes(3);
  });
});

describe('resultsWindow', () => {
  it('covers the last 30 days up to today in calendar dates', () => {
    expect(resultsWindow(new Date(2026, 9, 14, 22, 0))).toEqual({ from: '2026-09-14', to: '2026-10-14' });
    expect(resultsWindow(new Date(2026, 0, 5, 1, 0), 7)).toEqual({ from: '2025-12-29', to: '2026-01-05' });
  });
});
