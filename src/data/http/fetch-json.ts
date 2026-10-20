import { ProviderError } from '../../domain/repository';

export interface FetchJsonOptions {
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

/** Akamai blocks intermittently with 403 and, at times, 406. */
const BLOCKED_STATUSES = new Set([403, 406]);

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const fetchJson = async (
  url: string,
  options: FetchJsonOptions = {},
): Promise<unknown> => {
  const timeoutMs = options.timeoutMs ?? 15_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('timeoutMs must be a positive finite number');
  }

  const controller = new AbortController();
  const fetcher = options.fetcher ?? globalThis.fetch;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const request = (async (): Promise<unknown> => {
    let response: Response;
    try {
      response = await fetcher(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-cache',
        credentials: 'omit',
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ProviderError('timeout', `SELAE request timed out after ${timeoutMs} ms`);
      }
      throw new ProviderError('network', `SELAE request failed: ${errorMessage(error)}`);
    }

    if (BLOCKED_STATUSES.has(response.status)) {
      throw new ProviderError('blocked', `SELAE blocked the request (${response.status})`);
    }
    if (!response.ok) {
      throw new ProviderError('network', `SELAE responded with status ${response.status}`);
    }

    try {
      return await response.json();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ProviderError('timeout', `SELAE request timed out after ${timeoutMs} ms`);
      }
      throw new ProviderError('invalid', `SELAE returned invalid JSON: ${errorMessage(error)}`);
    }
  })();

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new ProviderError('timeout', `SELAE request timed out after ${timeoutMs} ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
};
