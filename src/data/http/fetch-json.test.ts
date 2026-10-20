import { describe, expect, it, vi } from 'vitest';
import { fetchJson } from './fetch-json';

const response = (body: string, status = 200): Response =>
  new Response(body, { status, headers: { 'Content-Type': 'application/json' } });

describe('fetchJson', () => {
  it('sends the required request options and returns parsed JSON', async () => {
    const fetcher: typeof fetch = vi.fn(async (_url, init) => {
      expect(init?.headers).toEqual({
        Accept: 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      expect(init?.cache).toBe('no-cache');
      expect(init?.credentials).toBe('omit');
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      return response('{"ok":true}');
    });

    await expect(fetchJson('https://example.test', { fetcher, useProxy: false })).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('classifies 403 and 406 as blocked and other HTTP errors as network failures', async () => {
    await expect(fetchJson('https://example.test', { fetcher: async () => response('', 403) }))
      .rejects.toHaveProperty('kind', 'blocked');
    await expect(fetchJson('https://example.test', { fetcher: async () => response('', 406) }))
      .rejects.toHaveProperty('kind', 'blocked');
    await expect(fetchJson('https://example.test', { fetcher: async () => response('', 500) }))
      .rejects.toHaveProperty('kind', 'network');
  });

  it('classifies invalid JSON and valid JSON strings separately', async () => {
    await expect(fetchJson('https://example.test', { fetcher: async () => response('not json') }))
      .rejects.toHaveProperty('kind', 'invalid');
    await expect(
      fetchJson('https://example.test', { fetcher: async () => response(JSON.stringify('sin registros')) }),
    ).resolves.toBe('sin registros');
  });

  it('aborts and reports timeout when the request does not complete', async () => {
    const fetcher: typeof fetch = vi.fn(() => new Promise<Response>(() => {}));
    await expect(fetchJson('https://example.test', { timeoutMs: 5, fetcher }))
      .rejects.toHaveProperty('kind', 'timeout');
  });
});
