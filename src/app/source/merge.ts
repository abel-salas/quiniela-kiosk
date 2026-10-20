import type { Draw, DrawSource } from '../../domain/draw';

/**
 * Combines draws by `date`. On a date present in both lists, the `preferred` source wins;
 * between draws of the same source, the incoming one replaces the stored one.
 */
export const mergeByDate = (current: Draw[], incoming: Draw[], preferred: DrawSource): Draw[] => {
  const byDate = new Map<string, Draw>(current.map((draw) => [draw.date, draw]));

  for (const draw of incoming) {
    const stored = byDate.get(draw.date);
    const keepStored = stored !== undefined && stored.source !== draw.source && stored.source === preferred;
    if (!keepStored) byDate.set(draw.date, draw);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
};
