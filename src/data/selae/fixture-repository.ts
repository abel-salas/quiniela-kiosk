import type { SelaeRepository } from '../../domain/repository';
import type { ResultGameId } from '../../domain/games';
import bonoResults from './__fixtures__/BONO.results.json';
import edmsResults from './__fixtures__/EDMS.results.json';
import elgrResults from './__fixtures__/ELGR.results.json';
import emilResults from './__fixtures__/EMIL.results.json';
import laprResults from './__fixtures__/LAPR.results.json';
import laquResults from './__fixtures__/LAQU.results.json';
import qgolResults from './__fixtures__/QGOL.results.json';
import todosNext from './__fixtures__/TODOS.next.json';
import { toDateOnly } from './parse/dates';
import { mapUpcoming } from './mappers/next-draw';
import { mapResults } from './mappers/results';

const RESULTS_FIXTURES: Record<ResultGameId, unknown> = {
  BONO: bonoResults,
  EDMS: edmsResults,
  ELGR: elgrResults,
  LAPR: laprResults,
  EMIL: emilResults,
  LAQU: laquResults,
  QGOL: qgolResults,
};

const normalizeDateBound = (value: string): string | null => {
  const date = /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;
  return toDateOnly(date);
};

export const createSelaeFixtureRepository = (): SelaeRepository => ({
  async getRecentDraws(gameId, from, to) {
    const fromDate = normalizeDateBound(from);
    const toDate = normalizeDateBound(to);
    if (!fromDate || !toDate || fromDate > toDate) return [];

    return mapResults(RESULTS_FIXTURES[gameId], gameId)
      .filter((draw) => draw.date >= fromDate && draw.date <= toDate);
  },

  async getUpcoming() {
    return mapUpcoming(todosNext);
  },
});
