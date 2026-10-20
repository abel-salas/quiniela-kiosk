import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import todos from '../../data/selae/__fixtures__/TODOS.next.json';
import { mapUpcoming } from '../../data/selae/mappers/next-draw';
import { selectUpcomingTiles } from '../../app/selectors/upcoming';
import type { BoardStore } from '../../app/store/board-store';
import { BoardStoreContext, ClockContext } from '../../app/store/hooks';
import { createInitialSnapshot } from '../../app/store/snapshot';
import { LiveUpcomingColumn, UpcomingColumn } from './UpcomingColumn';

const upcoming = mapUpcoming(todos);
const NOON = new Date(2026, 9, 20, 12, 0);
const count = (html: string, text: string) => html.split(text).length - 1;

describe('UpcomingColumn', () => {
  it('renders one tile per game in API order with amounts and countdowns', () => {
    const html = renderToStaticMarkup(<UpcomingColumn tiles={selectUpcomingTiles(upcoming, NOON)} />);
    expect(html).toContain('Próximos sorteos');
    expect(count(html, '<div class="upcoming-tile"')).toBe(10);
    expect(html.indexOf('Euromillones')).toBeLessThan(html.indexOf('Bonoloto'));
    expect(html.indexOf('Lotería Nacional')).toBeLessThan(html.indexOf('El Gordo de la Primitiva'));
    expect(html).toContain('59.000.000 €');
    expect(html).toContain('8h 30m');
    expect(html).toContain('al mes durante 30 años');
  });

  it('renders an empty column without tiles', () => {
    expect(count(renderToStaticMarkup(<UpcomingColumn tiles={[]} />), 'upcoming-tile"')).toBe(0);
  });
});

describe('LiveUpcomingColumn', () => {
  it('reads the board store and counts down with the app clock', () => {
    const snapshot = { ...createInitialSnapshot(), upcoming };
    const store: BoardStore = { getSnapshot: () => snapshot, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
    const clock = { now: () => new Date(2026, 9, 20, 20, 0) };
    const html = renderToStaticMarkup(
      <BoardStoreContext.Provider value={store}>
        <ClockContext.Provider value={clock}>
          <LiveUpcomingColumn />
        </ClockContext.Provider>
      </BoardStoreContext.Provider>,
    );
    expect(html).toContain('>30m<');
    expect(html.indexOf('Lototurf')).toBeGreaterThan(html.indexOf('El Gordo de la Primitiva'));
    expect(count(html, '<div class="upcoming-tile"')).toBe(10);
  });
});
