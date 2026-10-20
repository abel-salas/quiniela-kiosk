export const LEGACY_CACHE_PREFIX = 'draw:';

export type LegacyStorage = Pick<Storage, 'length' | 'key' | 'removeItem'>;

/** There is no persistent cache: removes the keys left by the old app (`draw:*`). */
export const clearLegacyCache = (storage: LegacyStorage | null): void => {
  if (!storage) return;
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(LEGACY_CACHE_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
};

export const browserStorage = (): LegacyStorage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};
