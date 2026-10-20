import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Clock } from '../clock';
import type { BoardStore } from './board-store';
import { BoardStoreContext, ClockContext, useBoard, useNow } from './hooks';
import { clearLegacyCache } from './legacy-cache';
import { createInitialSnapshot } from './snapshot';

describe('clearLegacyCache', () => {
  it('removes only draw:* keys', () => {
    const data = new Map([['draw:BONO', '1'], ['draw:LAQU', '2'], ['other', '3']]);
    const storage = {
      get length() {
        return data.size;
      },
      key: (index: number) => [...data.keys()][index] ?? null,
      removeItem: (key: string) => {
        data.delete(key);
      },
    };
    clearLegacyCache(storage);
    expect([...data.keys()]).toEqual(['other']);
    expect(() => clearLegacyCache(null)).not.toThrow();
  });
});

describe('hooks', () => {
  it('useBoard reads the snapshot of the provided store', () => {
    const snapshot = { ...createInitialSnapshot(), lastUpdatedAt: '2026-10-14T22:00:00' };
    const store: BoardStore = { getSnapshot: () => snapshot, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
    const Probe = () => createElement('span', null, useBoard().lastUpdatedAt);
    const html = renderToString(createElement(BoardStoreContext.Provider, { value: store }, createElement(Probe)));
    expect(html).toContain('2026-10-14T22:00:00');
  });

  it('useBoard fails clearly without a provider', () => {
    const Probe = () => createElement('span', null, useBoard().lastUpdatedAt);
    expect(() => renderToString(createElement(Probe))).toThrow('BoardStoreContext');
  });

  it('useNow reads the app clock', () => {
    const clock: Clock = { now: () => new Date(2026, 9, 14, 21, 40) };
    const Probe = () => createElement('span', null, String(useNow().getHours()));
    const html = renderToString(createElement(ClockContext.Provider, { value: clock }, createElement(Probe)));
    expect(html).toContain('21');
  });
});
