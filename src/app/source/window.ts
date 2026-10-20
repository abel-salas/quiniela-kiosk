import { toLocalDateKey } from '../refresh/time';

/** Wide enough to hold the latest draw of every game plus its week (see contexto-apis.md). */
export const RESULTS_WINDOW_DAYS = 30;

export interface DateWindow {
  from: string;
  to: string;
}

export const resultsWindow = (now: Date, days = RESULTS_WINDOW_DAYS): DateWindow => ({
  from: toLocalDateKey(now, -days),
  to: toLocalDateKey(now),
});
