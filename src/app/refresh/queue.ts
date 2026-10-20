export interface RequestQueue {
  run<T>(task: () => Promise<T>): Promise<T>;
}

export interface QueueOptions {
  concurrency?: number;
  spacingMs?: number;
}

/** Limits concurrent requests and spaces their starts (SELAE: 2 at a time, 500 ms apart). */
export const createRequestQueue = ({ concurrency = 2, spacingMs = 500 }: QueueOptions = {}): RequestQueue => {
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
