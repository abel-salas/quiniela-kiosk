import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { computeStageScale, Stage } from './Stage';

describe('computeStageScale', () => {
  it.each([
    [1920, 1080, 1],
    [3840, 2160, 2],
    [1280, 720, 2 / 3],
    [1920, 1200, 1],
    [2560, 1080, 1],
    [0, 0, 1],
  ])('fits 1920×1080 into %i×%i with scale %d', (width, height, scale) => {
    expect(computeStageScale(width, height)).toBeCloseTo(scale);
  });
});

describe('Stage', () => {
  it('renders the children inside the centred canvas', () => {
    const html = renderToString(<Stage><p>tablero</p></Stage>);
    expect(html).toContain('class="stage__canvas"');
    expect(html).toContain('translate(-50%, -50%) scale(');
    expect(html).toContain('<p>tablero</p>');
  });
});
