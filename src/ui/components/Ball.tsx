import { withAlpha } from './color';
import './Ball.css';

export interface BallProps {
  value: string;
  color: string;
  variant: 'solid' | 'soft';
}

export const Ball = ({ value, color, variant }: BallProps) => (
  <span
    className={`ball ball--${variant}`}
    style={{
      backgroundColor: variant === 'solid' ? color : withAlpha(color, 0.31),
      color: variant === 'solid' ? 'white' : color,
    }}
  >
    {value}
  </span>
);
