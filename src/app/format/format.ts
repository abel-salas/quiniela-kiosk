const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const parseCalendarDate = (value: string): Date => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new RangeError(`Invalid calendar date: ${value}`);

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return date;
};

export const formatBall = (value: number): string => String(value).padStart(2, '0');

/** `'2026-10-14'` → `"miércoles 14/10"` (full weekday, as SELAE's `dia_semana`). */
export const formatLineDate = (value: string): string =>
  `${formatWeekdayName(value)} ${value.slice(8, 10)}/${value.slice(5, 7)}`;

export const formatHeaderDate = (value: string): string => {
  const date = parseCalendarDate(value);
  return `${WEEKDAYS[date.getUTCDay()]} - ${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;
};

export const formatJoker = (value: string): string =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** `'2026-10-22'` → `"jueves"`. */
export const formatWeekdayName = (value: string): string =>
  WEEKDAY_NAMES[parseCalendarDate(value).getUTCDay()];

/** Local ISO instant `'2026-10-17T18:30:00'` → `"sáb 18:30"`. */
export const formatKickoff = (value: string): string =>
  `${WEEKDAYS[parseCalendarDate(value.slice(0, 10)).getUTCDay()]} ${value.slice(11, 16)}`;

/** Local ISO instant `'2026-10-14T21:45:10'` → `"21:45"`. */
export const formatTime = (value: string): string => value.slice(11, 16);

export const formatAmount = (value: number): string => {
  if (!Number.isFinite(value)) throw new RangeError('Amount must be finite');
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value)} €`;
};

const toTimestamp = (value: Date | string): number => {
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) throw new RangeError('Invalid countdown date');
  return timestamp;
};

export const formatCountdown = (from: Date | string, to: Date | string): string | null => {
  const difference = toTimestamp(to) - toTimestamp(from);
  if (difference <= 0) return null;

  const totalMinutes = Math.max(1, Math.floor(difference / 60_000));
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
  ].filter((part): part is string => part !== null).join(' ');
};

/** `'2026-10-25'` → `"dom 25/10"`; with local ISO `drawAt` → `"dom 25/10 · 21:30"`. */
export const formatDrawDate = (date: string, drawAt: string | null): string => {
  const day = `${WEEKDAYS[parseCalendarDate(date).getUTCDay()]} ${date.slice(8, 10)}/${date.slice(5, 7)}`;
  return drawAt ? `${day} · ${drawAt.slice(11, 16)}` : day;
};
