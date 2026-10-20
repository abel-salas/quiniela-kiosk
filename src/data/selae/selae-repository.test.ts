import { describe, expect, it } from 'vitest';
import bonoFixture from './__fixtures__/BONO.results.json';
import todosFixture from './__fixtures__/TODOS.next.json';
import { createSelaeRepository } from './selae-repository';

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('createSelaeRepository', () => {
  it('fetches and maps recent results', async () => {
    const requestedUrls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      requestedUrls.push(String(input));
      return jsonResponse(bonoFixture);
    };
    const repository = createSelaeRepository(fetcher);

    const draws = await repository.getRecentDraws('BONO', '20261001', '20261020');
    expect(draws).toHaveLength(3);
    expect(draws[2]).toMatchObject({ date: '2026-10-14', numbers: [8, 11, 21, 41, 47, 48] });
    expect(new URL(requestedUrls[0]).searchParams.get('game_id')).toBe('BONO');
  });

  it('fetches and maps upcoming draws', async () => {
    const requestedUrls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      requestedUrls.push(String(input));
      return jsonResponse(todosFixture);
    };
    const repository = createSelaeRepository(fetcher);

    const upcoming = await repository.getUpcoming();
    expect(upcoming).toHaveLength(20);
    expect(upcoming[0]).toMatchObject({ gameId: 'EMIL', date: '2026-10-20', jackpot: 59000000 });
    expect(new URL(requestedUrls[0]).searchParams.get('game_id')).toBe('TODOS');
  });

  it('passes SELAE no-records string responses to the mapper', async () => {
    const fetcher: typeof fetch = async () => jsonResponse('No se ha encontrado ningún registro');
    const repository = createSelaeRepository(fetcher);

    await expect(repository.getRecentDraws('BONO', '20261001', '20261020')).resolves.toEqual([]);
  });
});
