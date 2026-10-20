import { describe, expect, it } from 'vitest';
import todosFixture from './__fixtures__/TODOS.next.json';
import { createSelaeFixtureRepository } from './fixture-repository';

describe('createSelaeFixtureRepository', () => {
  it('maps results and filters the requested date range', async () => {
    const repository = createSelaeFixtureRepository();
    const draws = await repository.getRecentDraws('BONO', '20261012', '20261014');

    expect(draws.map((draw) => draw.date)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(draws[2]).toMatchObject({
      gameId: 'BONO',
      source: 'selae',
      numbers: [8, 11, 21, 41, 47, 48],
      extras: [
        { kind: 'complementario', values: ['34'] },
        { kind: 'reintegro', values: ['4'] },
      ],
    });
  });

  it('accepts calendar-date bounds and returns only matching football draws', async () => {
    const repository = createSelaeFixtureRepository();
    const draws = await repository.getRecentDraws('LAQU', '2026-10-10', '2026-10-12');

    expect(draws).toHaveLength(1);
    expect(draws[0]).toMatchObject({ date: '2026-10-11', kind: 'football', jornada: 12 });
  });

  it('returns no draws for invalid or reversed ranges', async () => {
    const repository = createSelaeFixtureRepository();
    await expect(repository.getRecentDraws('BONO', 'bad-date', '20261014')).resolves.toEqual([]);
    await expect(repository.getRecentDraws('BONO', '20261014', '20261012')).resolves.toEqual([]);
  });

  it('maps upcoming fixtures in their original order', async () => {
    const repository = createSelaeFixtureRepository();
    const upcoming = await repository.getUpcoming();

    expect(upcoming).toHaveLength(20);
    expect(upcoming.map((draw) => draw.gameId)).toEqual(todosFixture.map((draw) => draw.game_id));
    expect(upcoming[0]).toMatchObject({ gameId: 'EMIL', date: '2026-10-20', jackpot: 59000000 });
  });
});
