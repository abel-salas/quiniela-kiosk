export const DAILY_RELOAD_AT = '05:00';

export interface SanityEnv {
  projectId: string;
  dataset: string;
}

export interface AppConfig {
  /** `?mock=1`: fixture repositories instead of SELAE and Sanity. */
  mock: boolean;
  /** `?now=2026-10-14T21:40`, only with mock: the clock starts at this local instant and keeps running. */
  now: Date | null;
  /** Daily full page reload ('HH:mm', local time) to avoid kiosk memory leaks. */
  reloadAt: string;
  sanity: SanityEnv | null;
}

export interface AppEnv {
  VITE_SANITY_PROJECT_ID?: string;
  VITE_SANITY_DATASET?: string;
}

const LOCAL_INSTANT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

export const parseLocalInstant = (value: string | null): Date | null => {
  const match = value?.trim().match(LOCAL_INSTANT);
  if (!match) return null;

  const [year, month, day, hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0));
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  const isExact =
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && date.getHours() === hours
    && date.getMinutes() === minutes;
  return isExact ? date : null;
};

const isEnabled = (value: string | null): boolean => value === '1' || value === 'true';

const readSanityEnv = (env: AppEnv): SanityEnv | null => {
  const projectId = env.VITE_SANITY_PROJECT_ID?.trim();
  if (!projectId) return null;
  return { projectId, dataset: env.VITE_SANITY_DATASET?.trim() || 'production' };
};

export const readConfig = (search: string, env: AppEnv): AppConfig => {
  const params = new URLSearchParams(search);
  const mock = isEnabled(params.get('mock'));

  return {
    mock,
    now: mock ? parseLocalInstant(params.get('now')) : null,
    reloadAt: DAILY_RELOAD_AT,
    sanity: readSanityEnv(env),
  };
};
