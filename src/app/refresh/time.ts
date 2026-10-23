export const MINUTE_MS = 60_000;

const LOCAL_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * MINUTE_MS);

export const minutesBetween = (from: Date, to: Date): number =>
  (to.getTime() - from.getTime()) / MINUTE_MS;

const pad = (value: number): string => String(value).padStart(2, '0');

/** Local calendar date (`aaaa-mm-dd`) of an instant, optionally shifted by whole days. */
export const toLocalDateKey = (date: Date, dayOffset = 0): string => {
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}-${pad(shifted.getDate())}`;
};

/** Parses `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm[:ss]` as local time. */
export const parseLocalIso = (value: string): Date | null => {
  const match = value.match(LOCAL_ISO);
  if (!match) return null;
  const [year, month, day, hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0));
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Combines a calendar date with an 'HH:mm' time as local time. */
export const atLocalTime = (date: string, time: string): Date | null => parseLocalIso(`${date}T${time}`);

/** Local instant without zone, `aaaa-mm-ddTHH:mm:ss`. */
export const toLocalStamp = (date: Date): string =>
  `${toLocalDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
