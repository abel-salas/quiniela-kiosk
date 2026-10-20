import { Ball, type BallProps } from './Ball';
import './ExtraBall.css';

export interface ExtraBallProps {
  label: string;
  value: string;
  color: string;
  variant: BallProps['variant'];
}

export const ExtraBall = ({ label, value, color, variant }: ExtraBallProps) => (
  <div className="extra-ball">
    <span className="extra-ball__label">{label}</span>
    <Ball value={value} color={color} variant={variant} />
  </div>
);
