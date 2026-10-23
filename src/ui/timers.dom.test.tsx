// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { systemClock } from '../app/clock';
import { SlideStoreContext } from '../app/slides/hooks';
import type { SlideStore } from '../app/slides/slide-store';
import type { BoardStore } from '../app/store/board-store';
import { BoardStoreContext, ClockContext } from '../app/store/hooks';
import { createInitialSnapshot } from '../app/store/snapshot';
import todos from '../data/selae/__fixtures__/TODOS.next.json';
import { mapUpcoming } from '../data/selae/mappers/next-draw';
import { SlidePage } from './slides/SlidePage';
import { LiveUpcomingColumn } from './upcoming/UpcomingColumn';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(2026, 9, 20, 12, 0) });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

const firstCountdown = () => container.querySelector('.upcoming-tile__countdown')?.textContent;
const swiperContainer = () => container.querySelector('.slide-page__swiper');

describe('live timers in a DOM', () => {
  it('the upcoming countdown ticks every minute', () => {
    const snapshot = { ...createInitialSnapshot(), upcoming: mapUpcoming(todos) };
    const store: BoardStore = { getSnapshot: () => snapshot, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
    act(() => root.render(
      <BoardStoreContext.Provider value={store}>
        <ClockContext.Provider value={systemClock}>
          <LiveUpcomingColumn />
        </ClockContext.Provider>
      </BoardStoreContext.Provider>,
    ));
    expect(firstCountdown()).toBe('8h 30m');

    act(() => vi.advanceTimersByTime(60_000));
    expect(firstCountdown()).toBe('8h 29m');
  });

  it('the slides render with Swiper', () => {
    const slides = ['a', 'b', 'c'].map((id, order) => ({ id, title: id, imageUrl: `/${id}.jpg`, order }));
    const store: SlideStore = { getSnapshot: () => slides, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
    act(() => root.render(
      <MemoryRouter initialEntries={['/slide']}>
        <SlideStoreContext.Provider value={store}>
          <SlidePage />
        </SlideStoreContext.Provider>
      </MemoryRouter>,
    ));
    expect(swiperContainer()).not.toBeNull();
  });
});
