import { GAMES, type ResultGameId } from '../../domain/games';
import type { ResultsImporter } from '../../domain/repository';
import type { Clock } from '../clock';
import { formatLineDate, formatTime } from '../format/format';
import { REFRESH_ORDER } from '../refresh/calendar';
import { toLocalStamp } from '../refresh/time';
import { mergeByDate } from '../source/merge';
import { resultsWindow } from '../source/window';
import type { EntryCache } from '../store/entry-cache';

/** Result games in the refresh order (the jackpots list has no manual load). */
export const CMS_GAMES: readonly ResultGameId[] = REFRESH_ORDER.filter(
  (item): item is ResultGameId => item !== 'upcoming',
);

export interface CmsGameView {
  gameId: ResultGameId;
  name: string;
  logo: string;
  color: string;
  /** Provider request for the last week (two for football), to open in a new tab. */
  url: string;
  statusText: string;
}

export interface CmsSaveResult {
  ok: boolean;
  message: string;
}

export interface CmsService {
  games(): CmsGameView[];
  save(gameId: ResultGameId, text: string): CmsSaveResult;
}

export interface CmsDeps {
  importer: ResultsImporter;
  cache: EntryCache;
  clock: Clock;
}

export const NO_DATA_TEXT = 'Sin datos guardados';

const statusText = (savedAt: string, latestDate: string | null): string => {
  const stamp = toLocalStamp(new Date(savedAt));
  const saved = `Guardado el ${formatLineDate(stamp.slice(0, 10))} a las ${formatTime(stamp)}`;
  return latestDate ? `${saved} · último sorteo: ${formatLineDate(latestDate)}` : saved;
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const createCmsService = ({ importer, cache, clock }: CmsDeps): CmsService => ({
  games() {
    const now = clock.now();
    return CMS_GAMES.map((gameId) => {
      const { name, logo, color } = GAMES[gameId];
      const window = resultsWindow(now, gameId);
      const entry = cache.readResults(gameId, now);
      const latest = entry?.draws[entry.draws.length - 1] ?? null;
      return {
        gameId,
        name,
        logo,
        color,
        url: importer.resultsUrl(gameId, window.from, window.to),
        statusText: entry ? statusText(entry.savedAt, latest?.date ?? null) : NO_DATA_TEXT,
      };
    });
  },

  save(gameId, text) {
    const raw = parseJson(text.trim());
    if (raw === undefined) return { ok: false, message: 'El texto no es un JSON válido' };
    const incoming = importer.parseResults(gameId, raw);
    if (incoming.length === 0) {
      return { ok: false, message: `El JSON no contiene sorteos de ${GAMES[gameId].name}` };
    }
    const now = clock.now();
    const window = resultsWindow(now, gameId);
    const recent = incoming.filter((draw) => draw.date >= window.from);
    if (recent.length === 0) {
      return { ok: false, message: `Los sorteos del JSON son anteriores al ${formatLineDate(window.from)}` };
    }
    const current = cache.readResults(gameId, now)?.draws ?? [];
    const draws = mergeByDate(current, recent, 'selae').filter((draw) => draw.date >= window.from);
    cache.writeResults(gameId, draws, now);
    return { ok: true, message: `Guardados ${recent.length} sorteos de ${GAMES[gameId].name}` };
  },
});
