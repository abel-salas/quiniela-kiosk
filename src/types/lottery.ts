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
  combinacion?: string;
  combinacionActa?: string;
};

export type NumberOnlyDraw = DrawBase & {
  numbers: number[];
  complementario?: number;
  reintegro?: number;
  joker?: number | number[];
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

export type QuinielaMatch = {
  local: string;
  visitor: string;
  result: '1' | 'X' | '2' | null;
  fecha_completa?: string;
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
  fecha_completa?: string;
  signs: Array<'1' | 'X' | '2'>;
  matches?: QuinielaMatch[];
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
  history?: LotteryDraw[];
};

export type UpcomingDraw = {
  fecha: string;
  dia_semana: string;
  id_sorteo: string;
  game_id: GameCode;
  apertura: string;
  cierre: string;
  anyo: string;
  premio_bote: number | null;
  destacar_bote: string;
  cdc: string;
  recaudacion: number | null;
  estado: 'abierto' | 'cerrado';
  joker?: {
    gameid: string;
    relsorteoid_asociado: string;
    bote_joker: number;
    activo: string;
  };
};
