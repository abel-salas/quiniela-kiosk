import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAMES } from '../../domain/games';
import { logoUrl } from '../assets/logos';

// Vitest empties CSS imports (even `?raw`), so the file is read from disk.
const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

const GAME_IDS = Object.values(GAMES).map((game) => game.id);

const token = (name: string): string | null =>
  tokens.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim() ?? null;

const hexToRgb = (hex: string): string =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)).join(', ');

describe('theme tokens', () => {
  it.each(GAME_IDS)('%s brand colour matches the catalogue', (id) => {
    expect(token(`game-${id.toLowerCase()}`)).toBe(GAMES[id].color);
  });

  it.each(GAME_IDS)('%s soft colour is the brand colour at 31 %%', (id) => {
    expect(token(`game-${id.toLowerCase()}-soft`)).toBe(`rgba(${hexToRgb(GAMES[id].color)}, 0.31)`);
  });

  it('defines the SELAE neutrals', () => {
    expect(token('color-text')).toBe('#575756');
    expect(token('color-neutral')).toBe('#f6f6f6');
  });
});

describe('logos', () => {
  it.each(GAME_IDS)('%s has a local logo', (id) => {
    expect(logoUrl(GAMES[id].logo)).toEqual(expect.stringContaining(`${id}.svg`));
  });

  it('has the Joker and Millón logos and nothing else is invented', () => {
    expect(logoUrl('JOKER.svg')).not.toBeNull();
    expect(logoUrl('MILLON.svg')).not.toBeNull();
    expect(logoUrl('OTHER.svg')).toBeNull();
  });
});
