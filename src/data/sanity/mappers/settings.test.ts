import { describe, expect, it } from 'vitest';
import slides from '../__fixtures__/slides.json';
import { mapSlides } from './settings';

describe('mapSlides', () => {
  it('maps slides with an optional title', () => {
    expect(mapSlides(slides)).toEqual([
      { id: 'slide-1', title: 'Promoción 1', imageUrl: '/favicon.svg', order: 1 },
      { id: 'slide-2', title: null, imageUrl: '/favicon.svg', order: 2 },
    ]);
  });

  it('discards slides without image URL or order and sorts by order', () => {
    const result = mapSlides([
      { _id: 'b', order: 2, imageUrl: 'https://cdn.sanity.io/b.jpg' },
      { _id: 'no-image', order: 1, imageUrl: null },
      { _id: 'no-order', imageUrl: 'https://cdn.sanity.io/c.jpg' },
      { _id: 'a', order: 1, imageUrl: 'https://cdn.sanity.io/a.jpg' },
    ]);
    expect(result.map((slide) => slide.id)).toEqual(['a', 'b']);
    expect(mapSlides('not a list')).toEqual([]);
  });
});
