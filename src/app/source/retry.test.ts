import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withRetries } from './retry';
import { resultsWindow } from './window';

describe('withRetries', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('makes two attempts, 5 s apart, and returns the first success', async () => {
    const task = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('1'))
      .mockResolvedValueOnce('ok');
    const result = withRetries(task);

    await vi.advanceTimersByTimeAsync(0);
    expect(task).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(task).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(task).toHaveBeenCalledTimes(2);
    await expect(result).resolves.toBe('ok');
  });

  it('throws the last error after two failed attempts', async () => {
    const task = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'));
    const result = withRetries(task);
    const assertion = expect(result).rejects.toThrow('second');

    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;
    expect(task).toHaveBeenCalledTimes(2);
  });
});

describe('resultsWindow', () => {
  it('covers one week for numbers games and two for football, up to today', () => {
    const now = new Date(2026, 9, 14, 22, 0);
    expect(resultsWindow(now, 'BONO')).toEqual({ from: '2026-10-07', to: '2026-10-14' });
    expect(resultsWindow(now, 'LAQU')).toEqual({ from: '2026-09-30', to: '2026-10-14' });
    expect(resultsWindow(new Date(2026, 0, 5, 1, 0), 'EMIL')).toEqual({ from: '2025-12-29', to: '2026-01-05' });
  });
});
