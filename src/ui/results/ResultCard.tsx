import type { ReactNode } from 'react';
import type { CardView } from '../../app/selectors/types';
import { GameHeader } from '../components/GameHeader';
import './ResultCard.css';

export interface ResultCardProps {
  card: CardView;
  children: ReactNode;
}

/** Card shell: header with status badge, "pending" text, and a body that fades in when its content changes. */
export const ResultCard = ({ card, children }: ResultCardProps) => (
  <section className={`result-card result-card--${card.kind}`} data-game={card.gameId}>
    <GameHeader {...card.header} badge={card.badge} />
    <div key={card.contentKey} className="result-card__body">
      {card.emptyText ? <p className="result-card__empty">{card.emptyText}</p> : children}
    </div>
  </section>
);
