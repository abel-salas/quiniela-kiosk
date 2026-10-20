import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderError } from '../../domain/repository';
import { createRequestQueue } from './queue';

describe('createRequestQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

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

  it('pauses for 20 seconds after a blocked provider error', async () => {
    const queue = createRequestQueue();
    const task = vi.fn(async () => 'ok');
    await expect(queue.run(() => Promise.reject(new ProviderError('blocked', '403 Access Denied'))))
      .rejects.toThrow('403 Access Denied');
    const next = queue.run(task);

    await vi.advanceTimersByTimeAsync(19_999);
    expect(task).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(next).resolves.toBe('ok');
    expect(task).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(
      'SELAE request queue paused for 20000 ms: 403 Access Denied',
    );
  });

  it('does not pause after invalid provider errors or ordinary errors', async () => {
    const queue = createRequestQueue({ spacingMs: 0 });
    await expect(queue.run(() => Promise.reject(new ProviderError('invalid', 'bad data'))))
      .rejects.toThrow('bad data');
    await expect(queue.run(() => Promise.resolve('after invalid'))).resolves.toBe('after invalid');
    await expect(queue.run(() => Promise.reject(new Error('ordinary failure'))))
      .rejects.toThrow('ordinary failure');
    await expect(queue.run(() => Promise.resolve('after ordinary failure'))).resolves.toBe('after ordinary failure');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('restarts the cooldown after another provider error', async () => {
    const queue = createRequestQueue();
    const failingTask = () => Promise.reject(new ProviderError('network', 'request failed'));
    await expect(queue.run(failingTask)).rejects.toThrow('request failed');
    const secondFailure = queue.run(failingTask);
    const secondResult = expect(secondFailure).rejects.toThrow('request failed');
    await vi.advanceTimersByTimeAsync(20_000);
    await secondResult;

    const task = vi.fn(async () => 'ok');
    const next = queue.run(task);
    await vi.advanceTimersByTimeAsync(19_999);
    expect(task).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(next).resolves.toBe('ok');
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('keeps the 1.5 second spacing when requests succeed', async () => {
    const queue = createRequestQueue({ cooldownMs: 0 });
    const starts: number[] = [];
    const task = () => {
      starts.push(Date.now());
      return Promise.resolve();
    };
    const t0 = Date.now();
    const requests = [queue.run(task), queue.run(task)];

    await vi.advanceTimersByTimeAsync(1_500);
    await Promise.all(requests);
    expect(starts.map((start) => start - t0)).toEqual([0, 1_500]);
  });
});
