import type { UpcomingDraw } from '../../types/lottery';
import { GAME_CONFIG } from '../../config/gameConfig';
import { formatBote, formatDateTime } from '../../services/lottery/UpcomingService';

export const UpcomingDrawCard = ({ draw }: { draw: UpcomingDraw }) => {
  const gameConfig = GAME_CONFIG.find(g => g.code === draw.game_id);

  if (!gameConfig) return null;

  return (
    <div className="upcoming-card">
      <div className="upcoming-header">
        <span className="upcoming-game">{gameConfig.label}</span>
        <span className="upcoming-status estado-abierto">
          {draw.estado === 'abierto' ? 'ABIERTO' : 'CERRADO'}
        </span>
      </div>

      <div className="upcoming-body">
        <div className="upcoming-date">
          {formatDateTime(draw.fecha)}
        </div>

        {draw.premio_bote && draw.premio_bote > 0 && (
          <div className="upcoming-bote">
            <span className="bote-label">BOTE</span>
            <span className="bote-value">{formatBote(draw.premio_bote)}</span>
          </div>
        )}

        {draw.joker && draw.joker.bote_joker > 0 && (
          <div className="upcoming-joker">
            <span className="joker-label">JOKER</span>
            <span className="joker-value">{formatBote(draw.joker.bote_joker)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
