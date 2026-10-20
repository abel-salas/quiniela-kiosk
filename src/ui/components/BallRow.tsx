import { Ball } from './Ball';
import './BallRow.css';

export interface BallRowProps {
  values: string[];
  color: string;
}

export const BallRow = ({ values, color }: BallRowProps) => (
  <div className="ball-row" role="group" aria-label="Combinación">
    {values.map((value, index) => (
      <Ball key={`${index}-${value}`} value={value} color={color} variant="solid" />
    ))}
  </div>
);
