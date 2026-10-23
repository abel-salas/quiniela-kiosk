import { describe, expect, it } from 'vitest';
import bono from '../../data/selae/__fixtures__/BONO.results.json';
import { selaeImporter } from '../../data/selae/importer';
import { createEntryCache, createMemoryStorage } from '../store/entry-cache';
import { CMS_GAMES, createCmsService, NO_DATA_TEXT } from './cms';

const NOW = new Date(2026, 9, 14, 22, 0);

const setup = () => {
  const cache = createEntryCache(createMemoryStorage());
  return { cache, cms: createCmsService({ importer: selaeImporter, cache, clock: { now: () => NOW } }) };
};

describe('createCmsService', () => {
  it('lists the result games in refresh order with a one-week request link', () => {
    const games = setup().cms.games();
    expect(games.map((game) => game.gameId)).toEqual([...CMS_GAMES]);
    expect(CMS_GAMES).toEqual(['LAQU', 'QGOL', 'BONO', 'EMIL', 'LAPR', 'ELGR', 'EDMS']);
    const bonoGame = games.find((game) => game.gameId === 'BONO');
    expect(bonoGame).toMatchObject({ name: 'Bonoloto', logo: 'BONO.svg', statusText: NO_DATA_TEXT });
    expect(bonoGame?.url).toContain('game_id=BONO&fechaInicioInclusiva=20261007&fechaFinInclusiva=20261014');
    expect(games[0].url).toContain('fechaInicioInclusiva=20260930');
  });

  it('saves a pasted SELAE JSON into the game entry', () => {
    const { cms, cache } = setup();
    const result = cms.save('BONO', JSON.stringify(bono));

    expect(result).toEqual({ ok: true, message: 'Guardados 3 sorteos de Bonoloto' });
    expect(cache.readResults('BONO', NOW)?.draws.map((draw) => draw.date)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(cms.games().find((game) => game.gameId === 'BONO')?.statusText)
      .toBe('Guardado el miércoles 14/10 a las 22:00 · último sorteo: miércoles 14/10');
  });

  it('rejects invalid JSON and JSON of another game without touching the entry', () => {
    const { cms, cache } = setup();
    expect(cms.save('BONO', '{ nope')).toEqual({ ok: false, message: 'El texto no es un JSON válido' });
    expect(cms.save('EMIL', JSON.stringify(bono))).toEqual({ ok: false, message: 'El JSON no contiene sorteos de Euromillones' });
    expect(cache.readResults('EMIL', NOW)).toBeNull();
  });

  it('rejects draws older than the window', () => {
    const cache = createEntryCache(createMemoryStorage());
    const later = createCmsService({ importer: selaeImporter, cache, clock: { now: () => new Date(2026, 9, 23, 10, 0) } });
    expect(later.save('BONO', JSON.stringify(bono))).toEqual({
      ok: false,
      message: 'Los sorteos del JSON son anteriores al viernes 16/10',
    });
    expect(cache.readResults('BONO', NOW)).toBeNull();
  });
});
