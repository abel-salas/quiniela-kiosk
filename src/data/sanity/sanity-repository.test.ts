import { describe, expect, it } from 'vitest';
import type { SanityFetcher, SanityQueryParams } from './client';
import { createSanityFixtureRepository } from './fixture-repository';
import { SLIDES_QUERY } from './queries';
import { createSanityRepository } from './sanity-repository';

const fakeClient = (responses: Record<string, unknown>) => {
  const calls: { query: string; params?: SanityQueryParams }[] = [];
  const client: SanityFetcher = {
    fetch: async (query, params) => {
      calls.push({ query, params });
      return responses[query];
    },
  };
  return { client, calls };
};

describe('createSanityRepository', () => {
  it('maps slides', async () => {
    const { client, calls } = fakeClient({
      [SLIDES_QUERY]: [{ _id: 's', title: null, order: 1, imageUrl: 'https://cdn.sanity.io/s.jpg' }],
    });

    await expect(createSanityRepository(client).getSlides()).resolves.toEqual([
      { id: 's', title: null, imageUrl: 'https://cdn.sanity.io/s.jpg', order: 1 },
    ]);
    expect(calls).toEqual([{ query: SLIDES_QUERY, params: undefined }]);
  });

  it('wraps client failures as ProviderError', async () => {
    const failing: SanityFetcher = { fetch: async () => Promise.reject(new Error('offline')) };
    await expect(createSanityRepository(failing).getSlides()).rejects.toMatchObject({
      name: 'ProviderError',
      kind: 'network',
    });
  });
});

describe('createSanityFixtureRepository', () => {
  it('serves the slide fixtures', async () => {
    await expect(createSanityFixtureRepository().getSlides()).resolves.toHaveLength(2);
  });
});
