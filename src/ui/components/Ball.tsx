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
      backgroundColor: variant === 'solid' ? color : `color-mix(in srgb, ${color} 31%, white)`,
      color: variant === 'solid' ? 'white' : color,
    }}
  >
    {value}
  </span>
);
