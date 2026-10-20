import { ProviderError } from '../../domain/repository';

export interface RequestQueue {
  run<T>(task: () => Promise<T>): Promise<T>;
}

export interface QueueOptions {
  concurrency?: number;
  cooldownMs?: number;
  spacingMs?: number;
}

/** SELAE: one request at a time, with spacing and cooldowns to avoid Akamai blocks. */
export const SELAE_CONCURRENCY = 1;
export const SELAE_COOLDOWN_MS = 20_000;
export const SELAE_SPACING_MS = 1_500;

/** Limits concurrent requests and spaces their starts. */
export const createRequestQueue = ({
  concurrency = SELAE_CONCURRENCY,
  cooldownMs = SELAE_COOLDOWN_MS,
  spacingMs = SELAE_SPACING_MS,
}: QueueOptions = {}): RequestQueue => {
  const pending: (() => void)[] = [];
  let active = 0;
  let lastStartMs = Number.NEGATIVE_INFINITY;
  let cooldownUntilMs = Number.NEGATIVE_INFINITY;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const pump = (): void => {
    if (timer !== null || active >= concurrency || pending.length === 0) return;
    const waitMs = Math.max(lastStartMs + spacingMs, cooldownUntilMs) - Date.now();
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
            .then(resolve, (error: unknown) => {
              if (
                error instanceof ProviderError
                && (error.kind === 'blocked' || error.kind === 'network' || error.kind === 'timeout')
              ) {
                cooldownUntilMs = Date.now() + cooldownMs;
                console.warn(`SELAE request queue paused for ${cooldownMs} ms: ${error.message}`);
              }
              reject(error);
            })
            .finally(() => {
              active -= 1;
              pump();
            });
        });
        pump();
      }),
  };
};
