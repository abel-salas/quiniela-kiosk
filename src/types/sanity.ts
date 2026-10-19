// Tipos para Sanity CMS
import type { GameCode } from './lottery';

export type SanityLotteryDraw = {
  _id: string;
  _type: 'lotteryDraw';
  id: string; // Mapeado desde _id
  game: GameCode;
  date: string;
  scheduledDate?: string;
  status: 'celebrado' | 'pendiente';
  updatedAt: string;
  combinacion?: string;
  combinacionActa?: string;
  // Campos para juegos de números (BONO, LAPR)
  numbers?: number[];
  complementario?: number;
  reintegro?: number;
  joker?: string;
  // Campos para Euromillones
  stars?: number[];
  // Campos para El Gordo
  clave?: string;
  // Campos para Lotería Nacional
  primerPremio?: string;
  segundoPremio?: string;
  reintegros?: string[];
  // Campos para La Quiniela
  jornada?: number;
  fecha?: string;
  fecha_completa?: string;
  signs?: string[];
  matches?: Array<{
    local: string;
    visitor: string;
    result: string;
    fecha_completa?: string;
  }>;
  plenoAl15?: string;
};

export type SanitySlide = {
  _id: string;
  _type: 'slide';
  image: string;
  title?: string;
  order?: number;
};
