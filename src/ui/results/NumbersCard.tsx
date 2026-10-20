import type { NumbersCardView } from '../../app/selectors/types';
import { DrawLine } from '../components/DrawLine';
import { ResultCard } from './ResultCard';

/** Bonoloto, EuroDreams, El Gordo, La Primitiva, Euromillones: one line per draw of the week. */
export const NumbersCard = ({ card }: { card: NumbersCardView }) => (
  <ResultCard card={card}>
    {card.lines.map(({ key, ...line }) => (
      <DrawLine key={key} {...line} />
    ))}
  </ResultCard>
);
