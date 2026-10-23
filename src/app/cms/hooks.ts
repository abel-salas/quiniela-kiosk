import { createContext, useCallback, useContext, useState } from 'react';
import type { ResultGameId } from '../../domain/games';
import type { CmsGameView, CmsSaveResult, CmsService } from './cms';

export const CmsContext = createContext<CmsService | null>(null);

export interface CmsState {
  games: CmsGameView[];
  save(gameId: ResultGameId, text: string): CmsSaveResult;
}

/** `/cms` view: the games with their stored status, re-read after every save. */
export const useCms = (): CmsState => {
  const service = useContext(CmsContext);
  if (!service) throw new Error('useCms requires a CmsContext provider');
  const [games, setGames] = useState(() => service.games());
  const save = useCallback((gameId: ResultGameId, text: string) => {
    const result = service.save(gameId, text);
    if (result.ok) setGames(service.games());
    return result;
  }, [service]);
  return { games, save };
};
