const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:$|[ T]\d{2}:\d{2}(?::\d{2})?)$/;
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

const isValidDateOnly = (value: string): boolean => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const toDateOnly = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(DATE_ONLY_PATTERN);
  if (!match || !isValidDateOnly(match[1])) return null;
  return match[1];
};

export const toLocalIso = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(DATE_TIME_PATTERN);
  if (!match || !isValidDateOnly(match[1])) return null;

  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4] ?? '0');
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  if (hours === 0 && minutes === 0 && seconds === 0) return null;

  return `${match[1]}T${match[2]}:${match[3]}:${match[4] ?? '00'}`;
};

export const toApiDate = (date: Date): string => {
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date');

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};
