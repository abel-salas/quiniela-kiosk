import type { FootballCardView } from '../../app/selectors/types';
import { MatchRow } from '../components/MatchRow';
import { ResultCard } from './ResultCard';

/** El Quinigol: 6 matches with the result inside the sign box. */
export const QuinigolCard = ({ card }: { card: FootballCardView }) => (
  <ResultCard card={card}>
    {card.matches.map((match) => (
      <MatchRow key={match.position} {...match} />
    ))}
  </ResultCard>
);
