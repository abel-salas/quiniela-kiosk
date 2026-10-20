export interface RequestQueue {
  run<T>(task: () => Promise<T>): Promise<T>;
}

export interface QueueOptions {
  concurrency?: number;
  spacingMs?: number;
}

/** SELAE: one request at a time, 1.5 s between starts, to avoid Akamai's burst blocking (403/406). */
export const SELAE_CONCURRENCY = 1;
export const SELAE_SPACING_MS = 1_500;

/** Limits concurrent requests and spaces their starts. */
export const createRequestQueue = ({
  concurrency = SELAE_CONCURRENCY,
  spacingMs = SELAE_SPACING_MS,
}: QueueOptions = {}): RequestQueue => {
  const pending: (() => void)[] = [];
  let active = 0;
  let lastStartMs = Number.NEGATIVE_INFINITY;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const pump = (): void => {
    if (timer !== null || active >= concurrency || pending.length === 0) return;
    const waitMs = lastStartMs + spacingMs - Date.now();
    if (waitMs > 0) {
      timer = setTimeout(() => {
        timer = null;
        pump();
      }, waitMs);
      return;
    }
    const start = pending.shift();
    if (!start) return;
    active += 1;
    lastStartMs = Date.now();
    start();
    pump();
  };

  return {
    run: <T>(task: () => Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        pending.push(() => {
          task()
            .then(resolve, reject)
            .finally(() => {
              active -= 1;
              pump();
            });
        });
        pump();
      }),
  };
};
