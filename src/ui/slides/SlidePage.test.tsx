import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SlideStoreContext } from '../../app/slides/hooks';
import type { SlideStore } from '../../app/slides/slide-store';
import type { Slide } from '../../domain/slide';
import { SlidePage } from './SlidePage';

const render = (slides: Slide[]) => {
  const store: SlideStore = { getSnapshot: () => slides, subscribe: () => () => undefined, start: vi.fn(), stop: vi.fn() };
  return renderToStaticMarkup(
    <SlideStoreContext.Provider value={store}>
      <SlidePage />
    </SlideStoreContext.Provider>,
  );
};

describe('SlidePage', () => {
  it('renders Swiper with slides', () => {
    const html = render([
      { id: 'b', title: null, imageUrl: 'https://cdn.sanity.io/b.jpg', order: 2 },
      { id: 'a', title: 'Promo', imageUrl: 'https://cdn.sanity.io/a.jpg', order: 1 },
    ]);
    expect(html).toContain('slide-page__swiper');
    expect(html).toContain('slide-page__slide');
    expect(html.split('<img').length - 1).toBe(2);
    expect(html).toContain('src="https://cdn.sanity.io/a.jpg?w=2048&amp;fit=max" alt="Promo"');
    expect(html).toContain('src="https://cdn.sanity.io/b.jpg?w=2048&amp;fit=max"');
    expect(html).toContain('slide-page__progress-bar');
  });

  it('is a black screen without slides', () => {
    expect(render([])).toBe('<main class="slide-page slide-page--empty"></main>');
  });
});
