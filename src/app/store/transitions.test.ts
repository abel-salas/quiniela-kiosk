import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FootballDraw } from '../../domain/draw';
import type { ManualRepository, SelaeRepository } from '../../domain/repository';
import { createSelaeFixtureRepository } from '../../data/selae/fixture-repository';
import { systemClock } from '../clock';
import { PROVISIONAL_BADGE, selectBoardView } from '../selectors/results';
import { createBoardStore } from './board-store';

const manual: ManualRepository = {
  getRecentDraws: async () => [],
  getForcedGames: async () => [],
  getSlides: async () => [],
};

describe('provisional → final (T27)', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 14, 21, 30) }));
  afterEach(() => vi.useRealTimers());

  it('drops the PROVISIONAL badge and fades the card when the jornada becomes final', async () => {
    const fixture = createSelaeFixtureRepository();
    let final = false;
    const getUpcoming = vi.fn(() => fixture.getUpcoming());
    const selae: SelaeRepository = {
      getUpcoming,
      getRecentDraws: async (gameId, from, to) => {
        const draws = await fixture.getRecentDraws(gameId, from, to);
        if (gameId !== 'LAQU' || !final) return draws;
        return draws.map((draw) => (draw.kind === 'football' && draw.jornada === 13
          ? { ...draw, status: 'final', matches: draw.matches.map((m) => ({ ...m, sign: m.sign ?? '1' })) } satisfies FootballDraw
          : draw));
      },
    };
    const store = createBoardStore({ selae, manual, clock: systemClock, storage: null, reload: vi.fn(), events: { onWake: () => () => undefined } });
    store.start();
    await vi.advanceTimersByTimeAsync(10_000);

    const before = selectBoardView(store.getSnapshot(), new Date()).football[0];
    expect(before).toMatchObject({ badge: PROVISIONAL_BADGE, header: { dateText: 'Jornada 13ª' } });
    expect(store.getSnapshot().results.LAQU.phase).toBe('provisional');

    final = true;
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 10_000);

    const after = selectBoardView(store.getSnapshot(), new Date()).football[0];
    expect(after.badge).toBeNull();
    expect(after.contentKey).not.toBe(before.contentKey);
    expect(after.matches[14].sign).toBe('1');
    expect(store.getSnapshot().results.LAQU.phase).not.toBe('provisional');
    store.stop();
  });
});
