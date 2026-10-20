import { logoUrl } from '../assets/logos';
import './UpcomingTile.css';

export interface UpcomingTileProps {
  name: string;
  logo: string;
  color: string;
  amount: string | null;
  note?: string;
  countdown: string | null;
}

export const UpcomingTile = ({ name, logo, color, amount, note, countdown }: UpcomingTileProps) => {
  const imageUrl = logoUrl(logo);

  return (
    <div className="upcoming-tile">
      <div className="upcoming-tile__logo" style={{ backgroundColor: color }}>
        {imageUrl && <img src={imageUrl} alt="" />}
      </div>
      <div className="upcoming-tile__content" style={{ color }}>
        <div className="upcoming-tile__topline">
          <span className="upcoming-tile__name">{name}</span>
          {countdown && <span className="upcoming-tile__countdown">{countdown}</span>}
        </div>
        {amount && <span className="upcoming-tile__amount">{amount}</span>}
        {note && <span className="upcoming-tile__note">{note}</span>}
      </div>
    </div>
  );
};
