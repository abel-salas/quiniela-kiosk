import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Draw, DrawSource } from '../../domain/draw';
import type { ResultGameId } from '../../domain/games';
import { ProviderError, type ManualRepository, type ResultsRepository } from '../../domain/repository';
import { resolveDraws, resolveForcedGames } from './resolve-draws';

const WINDOW = { from: '2026-09-14', to: '2026-10-14' };

const draw = (date: string, source: DrawSource): Draw => ({
  gameId: 'BONO', drawId: `${source}-${date}`, date, source, kind: 'numbers', numbers: [1, 2, 3, 4, 5, 6], extras: [],
});

const fakeSelae = (...responses: (Draw[] | Error)[]) => {
  const getRecentDraws = vi.fn<ResultsRepository['getRecentDraws']>();
  for (const response of responses) {
    if (response instanceof Error) getRecentDraws.mockRejectedValueOnce(response);
    else getRecentDraws.mockResolvedValueOnce(response);
  }
  return { getRecentDraws };
};

const fakeManual = (draws: Draw[] | Error, forced: ResultGameId[] | Error = []): ManualRepository => ({
  getRecentDraws: vi.fn(async () => {
    if (draws instanceof Error) throw draws;
    return draws;
  }),
  getForcedGames: vi.fn(async () => {
    if (forced instanceof Error) throw forced;
    return forced;
  }),
  getSlides: vi.fn(async () => []),
});

const blocked = () => new ProviderError('blocked', '403');

describe('resolveDraws', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('uses SELAE with the window dates and merges with memory', async () => {
    const selae = fakeSelae([draw('2026-10-14', 'selae')]);
    const manual = fakeManual([]);
    const result = await resolveDraws({ selae, manual },
      { gameId: 'BONO', window: WINDOW, forced: false, current: [draw('2026-10-13', 'selae')] });

    expect(selae.getRecentDraws).toHaveBeenCalledWith('BONO', '2026-09-14', '2026-10-14');
    expect(manual.getRecentDraws).not.toHaveBeenCalled();
    expect(result).toEqual({ draws: [draw('2026-10-13', 'selae'), draw('2026-10-14', 'selae')], selaeError: null });
  });

  it('recovers on the second retry without touching Sanity', async () => {
    const selae = fakeSelae(blocked(), blocked(), [draw('2026-10-14', 'selae')]);
    const manual = fakeManual([draw('2026-10-14', 'sanity')]);
    const pending = resolveDraws({ selae, manual }, { gameId: 'BONO', window: WINDOW, forced: false, current: [] });

    await vi.advanceTimersByTimeAsync(5_000);
    expect(selae.getRecentDraws).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(pending).resolves.toEqual({ draws: [draw('2026-10-14', 'selae')], selaeError: null });
    expect(manual.getRecentDraws).not.toHaveBeenCalled();
  });

  it('falls back to Sanity after three failures and reports the SELAE error', async () => {
    const selae = fakeSelae(blocked(), blocked(), blocked());
    const manual = fakeManual([draw('2026-10-14', 'sanity'), draw('2026-10-13', 'sanity')]);
    const pending = resolveDraws({ selae, manual },
      { gameId: 'BONO', window: WINDOW, forced: false, current: [draw('2026-10-13', 'selae')] });

    await vi.advanceTimersByTimeAsync(15_000);
    const result = await pending;
    expect(selae.getRecentDraws).toHaveBeenCalledTimes(3);
    expect(result.selaeError).toBe('blocked');
    expect(result.draws.map((d) => `${d.date}:${d.source}`)).toEqual(['2026-10-13:selae', '2026-10-14:sanity']);
  });

  it('keeps memory when SELAE and Sanity both fail', async () => {
    const current = [draw('2026-10-13', 'selae')];
    const pending = resolveDraws({ selae: fakeSelae(new Error('x'), new Error('y'), new Error('z')), manual: fakeManual(new Error('down')) },
      { gameId: 'BONO', window: WINDOW, forced: false, current });

    await vi.advanceTimersByTimeAsync(15_000);
    await expect(pending).resolves.toEqual({ draws: current, selaeError: 'network' });
  });

  it('forced games read only Sanity, which wins on the same date', async () => {
    const selae = fakeSelae();
    const manual = fakeManual([draw('2026-10-14', 'sanity')]);
    const result = await resolveDraws({ selae, manual },
      { gameId: 'BONO', window: WINDOW, forced: true, current: [draw('2026-10-14', 'selae'), draw('2026-10-13', 'selae')] });

    expect(selae.getRecentDraws).not.toHaveBeenCalled();
    expect(result.selaeError).toBeNull();
    expect(result.draws.map((d) => `${d.date}:${d.source}`)).toEqual(['2026-10-13:selae', '2026-10-14:sanity']);
  });

  it('forced games keep memory if Sanity fails', async () => {
    const current = [draw('2026-10-14', 'sanity')];
    await expect(resolveDraws({ selae: fakeSelae(), manual: fakeManual(new Error('down')) },
      { gameId: 'BONO', window: WINDOW, forced: true, current })).resolves.toEqual({ draws: current, selaeError: null });
  });
});

describe('resolveForcedGames', () => {
  it('returns the Sanity list or keeps the previous one on failure', async () => {
    await expect(resolveForcedGames(fakeManual([], ['LAQU']), [])).resolves.toEqual(['LAQU']);
    await expect(resolveForcedGames(fakeManual([], new Error('down')), ['QGOL'])).resolves.toEqual(['QGOL']);
  });
});
