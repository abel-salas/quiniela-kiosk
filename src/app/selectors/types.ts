import type { ResultGameId } from '../../domain/games';

/** View models shaped like the props of ui/components; every text is already formatted. */

export interface GameHeaderView {
  name: string;
  logo: string;
  color: string;
  dateText?: string;
}

export interface ExtraBallView {
  label: string;
  value: string;
  color: string;
  variant: 'solid' | 'soft';
}

export interface AddOnView {
  logo: string;
  value: string;
}

export interface DrawLineView {
  key: string;
  dateText: string;
  balls: string[];
  color: string;
  extras: ExtraBallView[];
  addOn: AddOnView | null;
}

export interface MatchRowView {
  position: number;
  home: string;
  away: string;
  detail: string | null;
  sign: string | null;
  color: string;
  highlight: boolean;
}

interface CardViewBase {
  gameId: ResultGameId;
  header: GameHeaderView;
  /** "Pendiente de resultado" when there is nothing to show. */
  emptyText: string | null;
  /** Changes when the shown result changes: drives the 400 ms fade. */
  contentKey: string;
}

export interface NumbersCardView extends CardViewBase {
  kind: 'numbers';
  lines: DrawLineView[];
}

export interface FootballCardView extends CardViewBase {
  kind: 'football';
  matches: MatchRowView[];
}

export type CardView = NumbersCardView | FootballCardView;

export interface UpcomingTileView {
  key: string;
  name: string;
  logo: string;
  color: string;
  amount: string | null;
  note?: string;
  /** Top-right text: countdown to the close of sales or, without `salesCloseAt`, the draw date. */
  countdown: string | null;
}

export interface StatusBarView {
  updatedText: string;
  notice: string;
}

export interface BoardView {
  numbers: NumbersCardView[];
  football: FootballCardView[];
  upcoming: UpcomingTileView[];
  status: StatusBarView;
}
