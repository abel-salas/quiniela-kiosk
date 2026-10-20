import { logoUrl } from '../assets/logos';
import './GameHeader.css';

export interface GameHeaderProps {
  name: string;
  logo: string;
  color: string;
  dateText?: string;
  /** Status chip, e.g. "PROVISIONAL". */
  badge?: string | null;
}

export const GameHeader = ({ name, logo, color, dateText, badge }: GameHeaderProps) => {
  const imageUrl = logoUrl(logo);

  return (
    <header className="game-header" style={{ backgroundColor: color }}>
      {imageUrl && <img className="game-header__logo" src={imageUrl} alt="" />}
      <span className="game-header__name">{name}</span>
      {badge && <span className="game-header__badge" style={{ color }}>{badge}</span>}
      {dateText && <span className="game-header__date">{dateText}</span>}
    </header>
  );
};
