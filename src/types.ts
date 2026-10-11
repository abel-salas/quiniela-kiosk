export type GameCode = 'BONO' | 'ELGR' | 'LAPR' | 'EMIL' | 'LNAC' | 'LAQU';

export type LotteryGameConfig = {
  code: GameCode;
  label: string;
  shortLabel: string;
  kind: 'numbers' | 'gordo' | 'euromillones' | 'nacional' | 'quiniela';
};

export type DrawBase = {
  id: string;
  game: GameCode;
  date: string;
  scheduledDate: string;
  status: 'celebrado' | 'pendiente';
  updatedAt: string;
};

export type NumberOnlyDraw = DrawBase & {
  numbers: number[];
  complementario?: number;
  reintegro?: number;
  joker?: number;
};

export type GordoDraw = DrawBase & {
  numbers: number[];
  reintegro?: number;
  clave?: string;
};

export type EuroMillionsDraw = DrawBase & {
  numbers: number[];
  stars: number[];
};

export type NacionalDraw = DrawBase & {
  primerPremio?: number;
  segundoPremio?: number;
  reintegros?: number[];
};

export type QuinielaSign = {
  jornada: number;
  fecha: string;
  signos: Array<'1' | 'X' | '2'>;
  plenoAl15?: string;
};

export type QuinielaDraw = DrawBase & {
  jornada: number;
  fecha: string;
  signs: Array<'1' | 'X' | '2'>;
  plenoAl15?: string;
};

export type LotteryDraw =
  | NumberOnlyDraw
  | GordoDraw
  | EuroMillionsDraw
  | NacionalDraw
  | QuinielaDraw;

export type LotteryBoardItem = {
  game: LotteryGameConfig;
  draw: LotteryDraw;
};
