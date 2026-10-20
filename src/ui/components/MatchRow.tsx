import { withAlpha } from './color';
import { SignBox } from './SignBox';
import './MatchRow.css';

export interface MatchRowProps {
  position: number;
  home: string;
  away: string;
  detail: string | null;
  sign: string | null;
  color: string;
  highlight?: boolean;
}

export const MatchRow = ({
  position,
  home,
  away,
  detail,
  sign,
  color,
  highlight = false,
}: MatchRowProps) => {
  const backgroundColor = highlight
    ? withAlpha(color, 0.08)
    : position % 2 === 0
      ? withAlpha(color, 0.05)
      : undefined;

  return (
    <div
      className={`match-row${highlight ? ' match-row--highlight' : ''}`}
      style={{ backgroundColor }}
    >
      <span className="match-row__position">{position}.</span>
      <span className="match-row__teams">{home} - {away}</span>
      <span className="match-row__detail">{detail}</span>
      <SignBox sign={sign} color={color} />
    </div>
  );
};
