import { CACHE_CONFIG } from '../../config/constants';

export class CacheService {
  private static prefix = CACHE_CONFIG.PREFIX;
  private static defaultTTL = CACHE_CONFIG.TTL;

  static get<T>(key: string): T | null {
    const fullKey = `${this.prefix}${key}`;
    const raw = localStorage.getItem(fullKey);

    if (!raw) return null;

    try {
      const item = JSON.parse(raw);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(fullKey);
        return null;
      }
      return item.value as T;
    } catch {
      return null;
    }
  }

  static set<T>(key: string, value: T, ttl?: number): void {
    const fullKey = `${this.prefix}${key}`;
    const expiry = Date.now() + (ttl ?? this.defaultTTL);
    const item = { value, expiry };
    localStorage.setItem(fullKey, JSON.stringify(item));
  }

  static invalidate(pattern: string): void {
    const fullPattern = `${this.prefix}${pattern}`;
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPattern)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => localStorage.removeItem(key));
  }
}
