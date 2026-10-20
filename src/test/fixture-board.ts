import type { ResultGameId } from '../domain/games';
import bono from '../data/selae/__fixtures__/BONO.results.json';
import edms from '../data/selae/__fixtures__/EDMS.results.json';
import elgr from '../data/selae/__fixtures__/ELGR.results.json';
import emil from '../data/selae/__fixtures__/EMIL.results.json';
import lapr from '../data/selae/__fixtures__/LAPR.results.json';
import laqu from '../data/selae/__fixtures__/LAQU.results.json';
import qgol from '../data/selae/__fixtures__/QGOL.results.json';
import todos from '../data/selae/__fixtures__/TODOS.next.json';
import { mapUpcoming } from '../data/selae/mappers/next-draw';
import { mapResults } from '../data/selae/mappers/results';
import { createInitialSnapshot, RESULT_GAMES, withGame } from '../app/store/snapshot';
import type { BoardSnapshot } from '../app/store/types';

const RAW: Record<ResultGameId, unknown> = { BONO: bono, EDMS: edms, ELGR: elgr, LAPR: lapr, EMIL: emil, LAQU: laqu, QGOL: qgol };

/** Test support: board snapshot built from the real SELAE fixtures. */
export const FIXTURE_NOW = new Date(2026, 9, 14, 22, 0);

export const fixtureSnapshot = (): BoardSnapshot => {
  const base = { ...createInitialSnapshot(), upcoming: mapUpcoming(todos), lastUpdatedAt: '2026-10-14T21:45:10' };
  return RESULT_GAMES.reduce<BoardSnapshot>((snapshot, id) => withGame(snapshot, id, { draws: mapResults(RAW[id], id) }), base);
};
