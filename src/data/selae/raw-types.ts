export interface RawAddon {
  combinacion?: unknown;
}

export interface RawDraw {
  game_id?: unknown;
  id_sorteo?: unknown;
  fecha_sorteo?: unknown;
  combinacion?: unknown;
  jornada?: unknown;
  partidos?: unknown;
  joker?: RawAddon | null;
  millon?: RawAddon | null;
}

export interface RawMatch {
  posicion?: unknown;
  local?: unknown;
  visitante?: unknown;
  fecha_completa?: unknown;
  marcador?: unknown;
  signo?: unknown;
}

export interface RawNextDrawAddOn {
  bote_joker?: unknown;
  importe?: unknown;
  activo?: unknown;
}

export interface RawNextDraw {
  game_id?: unknown;
  fecha?: unknown;
  cierre?: unknown;
  estado?: unknown;
  premio_bote?: unknown;
  jornada?: unknown;
  joker?: RawNextDrawAddOn | null;
  millon?: RawNextDrawAddOn | null;
  primer_premio?: unknown;
  premio_especial?: unknown;
}
