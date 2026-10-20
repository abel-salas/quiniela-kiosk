import { describe, expect, it } from 'vitest';
import { cleanTeamName, cleanText, decodeEntities } from './text';

describe('text parsers', () => {
  it('decodes decimal and hexadecimal numeric entities', () => {
    expect(decodeEntities('&#x00ba; &#186;')).toBe('º º');
  });

  it('replaces newlines, collapses spaces, and trims', () => {
    expect(cleanText('  Equipo\n  local\t ')).toBe('Equipo local');
  });

  it('normalizes the SELAE match suffix', () => {
    expect(cleanTeamName(' Real Madrid   (m)\n')).toBe('Real Madrid (M)');
    expect(cleanTeamName('Villarreal')).toBe('Villarreal');
  });

  it('returns empty text for non-string input', () => {
    expect(cleanText(null)).toBe('');
  });
});
