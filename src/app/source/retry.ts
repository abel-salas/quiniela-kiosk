export const RETRY_DELAYS_MS = [5_000, 10_000];

export type Sleep = (ms: number) => Promise<void>;

export const sleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `task`; on failure retries once per delay. Throws the last error if every attempt fails. */
export const withRetries = async <T>(
  task: () => Promise<T>,
  delaysMs: readonly number[] = RETRY_DELAYS_MS,
  wait: Sleep = sleep,
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= delaysMs.length; attempt += 1) {
    if (attempt > 0) await wait(delaysMs[attempt - 1]);
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};
