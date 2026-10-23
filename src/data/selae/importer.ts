import type { ResultsImporter } from '../../domain/repository';
import { resultsUrl } from './endpoints';
import { mapResults } from './mappers/results';

/** `/cms`: the same `buscadorSorteos` request, opened by hand, and its mapper. */
export const selaeImporter: ResultsImporter = {
  resultsUrl,
  parseResults: (gameId, raw) => mapResults(raw, gameId),
};
