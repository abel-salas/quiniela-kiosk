import type { FootballCardView } from '../../app/selectors/types';
import { MatchRow } from '../components/MatchRow';
import { ResultCard } from './ResultCard';

export const PLENO_LABEL = 'Pleno al 15';

/** La Quiniela: 15 matches, the 15th highlighted as "Pleno al 15". */
export const QuinielaCard = ({ card }: { card: FootballCardView }) => (
  <ResultCard card={card}>
    {card.matches.map((match) => (
      <div key={match.position}>
        {match.highlight && (
          <div className="result-card__pleno" style={{ color: match.color }}>
            {PLENO_LABEL}
          </div>
        )}
        <MatchRow {...match} />
      </div>
    ))}
  </ResultCard>
);
