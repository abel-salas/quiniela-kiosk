import type { GameCode, LotteryDraw, LotteryGameConfig } from '../types';

export const GAME_CONFIG: LotteryGameConfig[] = [
  { code: 'BONO', label: 'BonoLoto', shortLabel: 'BONO', kind: 'numbers' },
  { code: 'ELGR', label: 'Gordo de la Primitiva', shortLabel: 'ELGR', kind: 'gordo' },
  { code: 'LAPR', label: 'La Primitiva', shortLabel: 'LAPR', kind: 'numbers' },
  { code: 'EMIL', label: 'Euromillones', shortLabel: 'EMIL', kind: 'euromillones' },
  { code: 'LNAC', label: 'Lotería Nacional', shortLabel: 'LNAC', kind: 'nacional' },
  { code: 'LAQU', label: 'La Quiniela', shortLabel: 'LAQU', kind: 'quiniela' },
];

export const fixtureDraws: Record<GameCode, LotteryDraw> = {
  BONO: {
    id: 'BONO-20260608',
    game: 'BONO',
    date: '2026-06-08',
    scheduledDate: '2026-06-08',
    status: 'celebrado',
    updatedAt: '2026-06-08T20:43:00Z',
    numbers: [5, 9, 12, 15, 21, 23],
    complementario: 31,
    reintegro: 5,
  },
  ELGR: {
    id: 'ELGR-20260607',
    game: 'ELGR',
    date: '2026-06-07',
    scheduledDate: '2026-06-07',
    status: 'celebrado',
    updatedAt: '2026-06-07T20:05:00Z',
    numbers: [27, 2, 3, 20, 41],
    clave: 'G5',
    reintegro: 8,
  },
  LAPR: {
    id: 'LAPR-20260608',
    game: 'LAPR',
    date: '2026-06-08',
    scheduledDate: '2026-06-08',
    status: 'celebrado',
    updatedAt: '2026-06-08T21:22:00Z',
    numbers: [4, 10, 20, 25, 40, 49],
    complementario: 29,
    reintegro: 3,
    joker: 12,
  },
  EMIL: {
    id: 'EMIL-20260608',
    game: 'EMIL',
    date: '2026-06-08',
    scheduledDate: '2026-06-08',
    status: 'celebrado',
    updatedAt: '2026-06-08T21:08:00Z',
    numbers: [6, 18, 22, 32, 41],
    stars: [8, 10],
  },
  LNAC: {
    id: 'LNAC-20260608',
    game: 'LNAC',
    date: '2026-06-08',
    scheduledDate: '2026-06-08',
    status: 'celebrado',
    updatedAt: '2026-06-08T20:00:00Z',
    primerPremio: 37343,
    segundoPremio: 43714,
    reintegros: [6, 11, 17, 19, 32, 41],
  },
  LAQU: {
    id: 'LAQU-20261011',
    game: 'LAQU',
    date: '2026-10-11',
    scheduledDate: '2026-10-11',
    status: 'celebrado',
    updatedAt: '2026-10-11T23:03:00Z',
    jornada: 12,
    fecha: '2026-10-11',
    signs: ['X', '2', '1', 'X', '1', '1', 'X', 'X', '1', '1', '1', '1', '2', '1', '1'],
    matches: [
      { local: 'Rayo Vallecano (m)', visitor: 'Athletic Club (m)', result: 'X' },
      { local: 'Alavés (m)', visitor: 'At. Madrid (m)', result: '2' },
      { local: 'Barcelona (m)', visitor: 'Getafe (m)', result: '1' },
      { local: 'Elche (m)', visitor: 'Celta (m)', result: 'X' },
      { local: 'Real Sociedad (m)', visitor: 'Deportivo (m)', result: '1' },
      { local: 'Betis (m)', visitor: 'Osasuna (m)', result: '1' },
      { local: 'Racing Santander (m)', visitor: 'Valencia (m)', result: 'X' },
      { local: 'Levante (m)', visitor: 'Sevilla (m)', result: 'X' },
      { local: 'Eldense (m)', visitor: 'Córdoba (m)', result: '1' },
      { local: 'Andorra (m)', visitor: 'Castellón (m)', result: '1' },
      { local: 'Almería (m)', visitor: 'Leganés (m)', result: '1' },
      { local: 'Mallorca (m)', visitor: 'Las Palmas (m)', result: '1' },
      { local: 'Burgos (m)', visitor: 'Granada (m)', result: '2' },
      { local: 'R. Oviedo (m)', visitor: 'Eibar (m)', result: '1' },
      { local: 'Real Madrid (m)', visitor: 'Villarreal (m)', result: '1' },
    ],
    plenoAl15: '0',
  },
};

const bonoHistory: LotteryDraw[] = [
  {
    ...fixtureDraws.BONO,
    id: 'BONO-20261005',
    date: '2026-10-05',
    scheduledDate: '2026-10-05',
    numbers: [8, 12, 13, 17, 20, 32],
    complementario: 14,
    reintegro: 6,
  },
  {
    ...fixtureDraws.BONO,
    id: 'BONO-20261008',
    date: '2026-10-08',
    scheduledDate: '2026-10-08',
    numbers: [7, 9, 15, 18, 24, 35],
    complementario: 20,
    reintegro: 4,
  },
  {
    ...fixtureDraws.BONO,
    id: 'BONO-20261012',
    date: '2026-10-12',
    scheduledDate: '2026-10-12',
    numbers: [5, 9, 12, 15, 21, 23],
    complementario: 31,
    reintegro: 5,
  },
];

const gordoHistory: LotteryDraw[] = [
  {
    ...fixtureDraws.ELGR,
    id: 'ELGR-20260928',
    date: '2026-09-28',
    scheduledDate: '2026-09-28',
    numbers: [11, 18, 24, 35, 42],
    clave: 'M7',
    reintegro: 3,
  },
  {
    ...fixtureDraws.ELGR,
    id: 'ELGR-20261005',
    date: '2026-10-05',
    scheduledDate: '2026-10-05',
    numbers: [5, 14, 22, 28, 37],
    clave: 'J2',
    reintegro: 5,
  },
  {
    ...fixtureDraws.ELGR,
    id: 'ELGR-20261012',
    date: '2026-10-12',
    scheduledDate: '2026-10-12',
    numbers: [27, 2, 3, 20, 41],
    clave: 'G5',
    reintegro: 8,
  },
];

const primitivaHistory: LotteryDraw[] = [
  {
    ...fixtureDraws.LAPR,
    id: 'LAPR-20261008',
    date: '2026-10-08',
    scheduledDate: '2026-10-08',
    numbers: [6, 7, 14, 16, 21, 37],
    complementario: 25,
    reintegro: 2,
    joker: 2445443,
  },
  {
    ...fixtureDraws.LAPR,
    id: 'LAPR-20261010',
    date: '2026-10-10',
    scheduledDate: '2026-10-10',
    numbers: [10, 16, 18, 20, 22, 29],
    complementario: 11,
    reintegro: 7,
    joker: 9871681,
  },
  {
    ...fixtureDraws.LAPR,
    id: 'LAPR-20261012',
    date: '2026-10-12',
    scheduledDate: '2026-10-12',
    numbers: [2, 5, 26, 40, 42, 45],
    complementario: 23,
    reintegro: 9,
    joker: 4781884,
  },
];

const euromillonesHistory: LotteryDraw[] = [
  {
    ...fixtureDraws.EMIL,
    id: 'EMIL-20261008',
    date: '2026-10-08',
    scheduledDate: '2026-10-08',
    numbers: [2, 8, 14, 18, 30],
    stars: [4, 9],
  },
  {
    ...fixtureDraws.EMIL,
    id: 'EMIL-20261010',
    date: '2026-10-10',
    scheduledDate: '2026-10-10',
    numbers: [6, 11, 19, 33, 42],
    stars: [7, 12],
  },
  {
    ...fixtureDraws.EMIL,
    id: 'EMIL-20261012',
    date: '2026-10-12',
    scheduledDate: '2026-10-12',
    numbers: [5, 9, 20, 26, 39],
    stars: [1, 10],
  },
];

export const fallbackBoard = GAME_CONFIG.map((game) => {
  const draw = fixtureDraws[game.code];

  if (game.code === 'BONO') {
    return { game, draw, history: bonoHistory };
  }

  if (game.code === 'ELGR') {
    return { game, draw, history: gordoHistory };
  }

  if (game.code === 'LAPR') {
    return { game, draw, history: primitivaHistory };
  }

  if (game.code === 'EMIL') {
    return { game, draw, history: euromillonesHistory };
  }

  return { game, draw };
});
