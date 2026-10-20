import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { BoardStore } from '../../app/store/board-store';
import { BoardStoreContext, ClockContext } from '../../app/store/hooks';
import { FIXTURE_NOW, fixtureSnapshot } from '../../test/fixture-board';
import { BoardPage } from './BoardPage';

const render = () => {
  const snapshot = fixtureSnapshot();
  const store: BoardStore = { getSnapshot: () => snapshot, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
  return renderToStaticMarkup(
    <BoardStoreContext.Provider value={store}>
      <ClockContext.Provider value={{ now: () => FIXTURE_NOW }}>
        <BoardPage />
      </ClockContext.Provider>
    </BoardStoreContext.Provider>,
  );
};

describe('BoardPage', () => {
  const html = render();

  it('renders the three columns inside the stage and the status bar', () => {
    expect(html).toContain('class="stage__canvas"');
    for (const column of ['board-page__numbers', 'board-page__football', 'board-page__upcoming', 'status-bar']) {
      expect(html).toContain(column);
    }
    expect(html).toContain('Actualizado 21:45');
  });

  it('shows the 7 result games in column order', () => {
    const order = ['Bonoloto', 'EuroDreams', 'El Gordo de la Primitiva', 'La Primitiva', 'Euromillones', 'La Quiniela', 'El Quinigol']
      .map((name) => html.indexOf(`game-header__name">${name}<`));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('renders the upcoming column with one tile per game', () => {
    expect(html.split('<div class="upcoming-tile"').length - 1).toBe(10);
  });
});
