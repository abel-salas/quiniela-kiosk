import type { CSSProperties, ReactNode } from 'react';
import type { CardView } from '../../app/selectors/types';
import { GameHeader } from '../components/GameHeader';
import './ResultCard.css';

export interface ResultCardProps {
  card: CardView;
  children: ReactNode;
}

/** Card shell: header, "pending" text, and a body that fades in when its content changes. */
/** Numbers cards share the column height by line count (see ResultCard.css). */
const lineCountStyle = (card: CardView): CSSProperties | undefined =>
  card.kind === 'numbers' && card.lines.length > 0 ? ({ '--lines': card.lines.length } as CSSProperties) : undefined;

export const ResultCard = ({ card, children }: ResultCardProps) => (
  <section className={`result-card result-card--${card.kind}`} data-game={card.gameId} style={lineCountStyle(card)}>
    <GameHeader {...card.header} />
    <div key={card.contentKey} className="result-card__body">
      {card.emptyText ? <p className="result-card__empty">{card.emptyText}</p> : children}
    </div>
  </section>
);
