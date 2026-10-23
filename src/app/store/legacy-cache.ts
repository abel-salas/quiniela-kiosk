export const LEGACY_CACHE_PREFIX = 'draw:';
/** Single 12 h board cache, replaced by one entry per prize. */
export const LEGACY_BOARD_KEY = 'quiniela:board:v1';

export type LegacyStorage = Pick<Storage, 'length' | 'key' | 'removeItem'>;
export type KioskStorage = LegacyStorage & Pick<Storage, 'getItem' | 'setItem'>;

/** Removes only keys left by older versions (`draw:*` and the single board cache). */
export const clearLegacyCache = (storage: LegacyStorage | null): void => {
  if (!storage) return;
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(LEGACY_CACHE_PREFIX) || key === LEGACY_BOARD_KEY) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
};

export const browserStorage = (): KioskStorage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};
