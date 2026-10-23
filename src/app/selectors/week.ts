import type { Draw } from '../../domain/draw';

export const WEEK_DAYS = 7;

const shiftDate = (date: string, days: number): string => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

/**
 * Current-week stack: draws with `date > latest - 7 days`, ascending (oldest on top).
 * Football shows only the most recent finished jornada: an open one is never shown.
 */
export const selectWeekDraws = (draws: Draw[]): Draw[] => {
  const sorted = [...draws]
    .filter((draw) => draw.kind === 'numbers' || draw.status === 'final')
    .sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];
  const latest = sorted[sorted.length - 1];
  if (latest.kind === 'football') return [latest];

  const since = shiftDate(latest.date, -WEEK_DAYS);
  return sorted.filter((draw) => draw.date > since);
};
