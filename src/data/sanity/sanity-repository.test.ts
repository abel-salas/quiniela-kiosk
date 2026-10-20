import { describe, expect, it } from 'vitest';
import draws from './__fixtures__/draws.json';
import type { SanityFetcher, SanityQueryParams } from './client';
import { createSanityFixtureRepository } from './fixture-repository';
import { DRAWS_QUERY, FORCED_GAMES_QUERY, SLIDES_QUERY } from './queries';
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
  it('queries draws with dashed date bounds and maps them', async () => {
    const { client, calls } = fakeClient({ [DRAWS_QUERY]: draws });
    const result = await createSanityRepository(client).getRecentDraws('BONO', '20261008', '20261014');

    expect(calls).toEqual([{ query: DRAWS_QUERY, params: { game: 'BONO', from: '2026-10-08', to: '2026-10-14' } }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ gameId: 'BONO', source: 'sanity', date: '2026-10-14' });
  });

  it('maps forced games and slides', async () => {
    const { client } = fakeClient({
      [FORCED_GAMES_QUERY]: ['LAQU'],
      [SLIDES_QUERY]: [{ _id: 's', title: null, order: 1, imageUrl: 'https://cdn.sanity.io/s.jpg' }],
    });
    const repository = createSanityRepository(client);

    await expect(repository.getForcedGames()).resolves.toEqual(['LAQU']);
    await expect(repository.getSlides()).resolves.toEqual([
      { id: 's', title: null, imageUrl: 'https://cdn.sanity.io/s.jpg', order: 1 },
    ]);
  });

  it('does not query with invalid bounds and wraps client failures as ProviderError', async () => {
    const { client, calls } = fakeClient({});
    await expect(createSanityRepository(client).getRecentDraws('BONO', 'x', '20261014')).resolves.toEqual([]);
    expect(calls).toHaveLength(0);

    const failing: SanityFetcher = { fetch: async () => Promise.reject(new Error('offline')) };
    await expect(createSanityRepository(failing).getForcedGames()).rejects.toMatchObject({
      name: 'ProviderError',
      kind: 'network',
    });
  });
});

describe('createSanityFixtureRepository', () => {
  it('serves the hand-written fixtures filtered by game and date range', async () => {
    const repository = createSanityFixtureRepository();
    const laqu = await repository.getRecentDraws('LAQU', '2026-10-08', '2026-10-14');

    expect(laqu).toHaveLength(1);
    expect(laqu[0]).toMatchObject({ kind: 'football', jornada: 12, source: 'sanity' });
    await expect(repository.getRecentDraws('LAQU', '20261012', '20261014')).resolves.toEqual([]);
    await expect(repository.getForcedGames()).resolves.toEqual([]);
    await expect(repository.getSlides()).resolves.toHaveLength(2);
  });

  it('has a valid fixture for every result game', async () => {
    const repository = createSanityFixtureRepository();
    for (const gameId of ['BONO', 'EDMS', 'ELGR', 'LAPR', 'EMIL', 'LAQU', 'QGOL'] as const) {
      await expect(repository.getRecentDraws(gameId, '20261001', '20261031')).resolves.toHaveLength(1);
    }
  });
});
