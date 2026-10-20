export type GameId =
  | 'LNAC'
  | 'EMIL'
  | 'LAPR'
  | 'BONO'
  | 'ELGR'
  | 'LAQU'
  | 'QGOL'
  | 'LOTU'
  | 'EDMS'
  | 'QUPL';

export type ResultGameId = 'BONO' | 'EDMS' | 'ELGR' | 'LAPR' | 'EMIL' | 'LAQU' | 'QGOL';
export type GameKind = 'numbers' | 'football';

export interface GameInfo {
  id: GameId;
  name: string;
  color: string;
  logo: string;
  resultsFromTime: string | null;
  upcomingNote: string | null;
  upcomingDefaultAmount: number | null;
}

export const GAMES: Record<GameId, GameInfo> = {
  LNAC: {
    id: 'LNAC',
    name: 'Lotería Nacional',
    color: '#007ac0',
    logo: 'LNAC.svg',
    resultsFromTime: null,
    upcomingNote: 'sábado',
    upcomingDefaultAmount: null,
  },
  EMIL: {
    id: 'EMIL',
    name: 'Euromillones',
    color: '#001367',
    logo: 'EMIL.svg',
    resultsFromTime: '21:00',
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  LAPR: {
    id: 'LAPR',
    name: 'La Primitiva',
    color: '#008547',
    logo: 'LAPR.svg',
    resultsFromTime: '21:30',
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  BONO: {
    id: 'BONO',
    name: 'Bonoloto',
    color: '#7a8634',
    logo: 'BONO.svg',
    resultsFromTime: '21:15',
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  ELGR: {
    id: 'ELGR',
    name: 'El Gordo de la Primitiva',
    color: '#dc3f47',
    logo: 'ELGR.svg',
    resultsFromTime: '21:30',
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  LAQU: {
    id: 'LAQU',
    name: 'La Quiniela',
    color: '#cb1517',
    logo: 'LAQU.svg',
    resultsFromTime: null,
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  QGOL: {
    id: 'QGOL',
    name: 'El Quinigol',
    color: '#74bacd',
    logo: 'QGOL.svg',
    resultsFromTime: null,
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  LOTU: {
    id: 'LOTU',
    name: 'Lototurf',
    color: '#d16929',
    logo: 'LOTU.svg',
    resultsFromTime: null,
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
  EDMS: {
    id: 'EDMS',
    name: 'EuroDreams',
    color: '#6e368c',
    logo: 'EDMS.svg',
    resultsFromTime: '20:55',
    upcomingNote: 'al mes durante 30 años',
    upcomingDefaultAmount: 20000,
  },
  QUPL: {
    id: 'QUPL',
    name: 'Quíntuple Plus',
    color: '#eab842',
    logo: 'QUPL.svg',
    resultsFromTime: null,
    upcomingNote: null,
    upcomingDefaultAmount: null,
  },
};

export const RESULT_COLUMNS: { numbers: ResultGameId[]; football: ResultGameId[] } = {
  numbers: ['BONO', 'EDMS', 'ELGR', 'LAPR', 'EMIL'],
  football: ['LAQU', 'QGOL'],
};
