import { describe, expect, it } from 'vitest';
import type { Slide } from '../../domain/slide';
import { nextSlideIndex, reconcileSlideIndex, selectSlideViews } from './slides';

const slide = (id: string, order: number, imageUrl = `https://cdn.sanity.io/images/p/d/${id}.jpg`): Slide =>
  ({ id, title: id === 'a' ? 'Promo A' : null, imageUrl, order });

describe('selectSlideViews', () => {
  it('sorts by order and requests the tablet size from the Sanity CDN', () => {
    expect(selectSlideViews([slide('b', 2), slide('a', 1)])).toEqual([
      { key: 'a', imageUrl: 'https://cdn.sanity.io/images/p/d/a.jpg?w=2048&fit=max', alt: 'Promo A' },
      { key: 'b', imageUrl: 'https://cdn.sanity.io/images/p/d/b.jpg?w=2048&fit=max', alt: '' },
    ]);
  });

  it('keeps existing query parameters', () => {
    expect(selectSlideViews([slide('a', 1, 'https://cdn.sanity.io/x.jpg?dl=1')])[0].imageUrl)
      .toBe('https://cdn.sanity.io/x.jpg?dl=1&w=2048&fit=max');
  });
});

describe('slide rotation helpers', () => {
  it('advances cyclically', () => {
    expect(nextSlideIndex(0, 3)).toBe(1);
    expect(nextSlideIndex(2, 3)).toBe(0);
    expect(nextSlideIndex(0, 0)).toBe(0);
  });

  it('keeps showing the same slide after a reload, or stays in range', () => {
    const before = selectSlideViews([slide('a', 1), slide('b', 2), slide('c', 3)]);
    expect(reconcileSlideIndex(before, selectSlideViews([slide('z', 0), slide('b', 2)]), 1)).toBe(1);
    expect(reconcileSlideIndex(before, selectSlideViews([slide('c', 1), slide('b', 2)]), 1)).toBe(1);
    expect(reconcileSlideIndex(before, selectSlideViews([slide('x', 1)]), 2)).toBe(0);
    expect(reconcileSlideIndex(before, [], 2)).toBe(0);
  });
});
