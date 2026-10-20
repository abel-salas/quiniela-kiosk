import { describe, expect, it } from 'vitest';
import { withAlpha } from './color';

describe('withAlpha', () => {
  it('turns a brand colour into rgba without CSS color-mix', () => {
    expect(withAlpha('#008547', 0.31)).toBe('rgba(0, 133, 71, 0.31)');
    expect(withAlpha('#CB1517', 0.05)).toBe('rgba(203, 21, 23, 0.05)');
  });

  it('leaves values that are not #rrggbb untouched', () => {
    expect(withAlpha('red', 0.5)).toBe('red');
  });
});
