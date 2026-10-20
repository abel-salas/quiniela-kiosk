const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const COMPACT_DATE = /^(\d{4})(\d{2})(\d{2})$/;
const SPAIN_TIME_ZONE = 'Europe/Madrid';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const toDateOnly = (value: unknown): string | null => {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null;
};

/** Accepts `aaaammdd` (same bounds as SELAE) or `aaaa-mm-dd`. */
export const toDateBound = (value: string): string | null => {
  const compact = value.match(COMPACT_DATE);
  return toDateOnly(compact ? `${compact[1]}-${compact[2]}-${compact[3]}` : value);
};

const spainFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: SPAIN_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Sanity stores datetimes in UTC; the domain uses Spanish peninsular local time without zone. */
export const toSpainLocalIso = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = Object.fromEntries(
    spainFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
};

export const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export const optionalText = (value: unknown): string | null | undefined => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return undefined;
  const text = value.replace(/\s+/g, ' ').trim();
  return text || null;
};
