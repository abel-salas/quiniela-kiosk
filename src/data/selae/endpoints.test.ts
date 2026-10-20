import { describe, expect, it } from 'vitest';
import { nextDrawUrl, resultsUrl } from './endpoints';

describe('SELAE endpoints', () => {
  it('builds the results URL with encoded query parameters', () => {
    const url = new URL(resultsUrl('LAQU', '20261001', '20261020'));
    expect(url.origin + url.pathname).toBe('https://www.loteriasyapuestas.es/servicios/buscadorSorteos');
    expect(url.searchParams.get('game_id')).toBe('LAQU');
    expect(url.searchParams.get('fechaInicioInclusiva')).toBe('20261001');
    expect(url.searchParams.get('fechaFinInclusiva')).toBe('20261020');
    expect(url.searchParams.get('celebrados')).toBe('true');
  });

  it('builds the all-games upcoming URL', () => {
    const url = new URL(nextDrawUrl());
    expect(url.pathname).toBe('/servicios/proximosv3');
    expect(url.searchParams.get('game_id')).toBe('TODOS');
    expect(url.searchParams.get('num')).toBe('2');
  });
});
