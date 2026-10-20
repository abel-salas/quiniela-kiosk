import type { ConditionalPropertyCallbackContext, ValidationContext } from 'sanity';
import { GAMES, RESULT_COLUMNS, type ResultGameId } from '../../src/domain/games';

export const RESULT_GAMES: ResultGameId[] = [...RESULT_COLUMNS.numbers, ...RESULT_COLUMNS.football];

export const RESULT_GAME_OPTIONS = RESULT_GAMES.map((id) => ({ title: GAMES[id].name, value: id }));

type GameLengths = Partial<Record<ResultGameId, number>>;

const gameOf = (document: object | undefined): unknown =>
  document && 'game' in document ? document.game : undefined;

const isOneOf = (game: unknown, games: readonly ResultGameId[]): game is ResultGameId =>
  typeof game === 'string' && games.some((id) => id === game);

export const hiddenUnless =
  (games: readonly ResultGameId[]) =>
  ({ document }: ConditionalPropertyCallbackContext): boolean =>
    !isOneOf(gameOf(document), games);

export const requiredFor =
  (games: readonly ResultGameId[]) =>
  (value: unknown, context: ValidationContext): true | string =>
    !isOneOf(gameOf(context.document), games) || (value !== undefined && value !== null)
      ? true
      : 'Obligatorio para este juego';

export const exactLengthFor =
  (lengths: GameLengths) =>
  (value: unknown[] | undefined, context: ValidationContext): true | string => {
    const game = gameOf(context.document);
    const expected = isOneOf(game, RESULT_GAMES) ? lengths[game] : undefined;
    if (expected === undefined) return true;
    const length = value?.length ?? 0;
    return length === expected ? true : `Debe tener exactamente ${expected} elementos (tiene ${length})`;
  };
