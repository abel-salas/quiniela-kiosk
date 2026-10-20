import type { ResultGameId } from './games';

export type DrawSource = 'selae' | 'sanity';

interface DrawBase {
  gameId: ResultGameId;
  drawId: string;
  date: string;
  source: DrawSource;
}

export type ExtraKind =
  | 'complementario'
  | 'reintegro'
  | 'clave'
  | 'estrellas'
  | 'joker'
  | 'millon'
  | 'sueno';

export interface DrawExtra {
  kind: ExtraKind;
  values: string[];
}

export interface NumbersDraw extends DrawBase {
  kind: 'numbers';
  numbers: number[];
  extras: DrawExtra[];
}

export interface Match {
  position: number;
  home: string;
  away: string;
  kickoff: string | null;
  score: string | null;
  sign: string | null;
}

export interface FootballDraw extends DrawBase {
  kind: 'football';
  jornada: number;
  status: 'open' | 'final';
  matches: Match[];
}

export type Draw = NumbersDraw | FootballDraw;
