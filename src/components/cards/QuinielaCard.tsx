import type { LotteryBoardItem } from '../../types/lottery';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

const formatMatchDateTime = (date: string) => {
  if (!date) return '';

  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    const weekday = parsed.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = parsed.toLocaleDateString('es-ES', { day: 'numeric' });
    const time = parsed.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} - ${time}`;
  } catch {
    return date;
  }
};

const formatMatchTime = (date: string) => {
  if (!date) return '';

  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return date;
  }
};

const cleanTeamName = (name: string) => name.replace(/\s*\(m\)\s*$/i, '').trim();

export const QuinielaCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw, game } = boardItem;
  const qdraw = draw as any;
  const matches = Array.isArray(qdraw.matches) && qdraw.matches.length > 0
    ? qdraw.matches
    : (Array.isArray(qdraw.signs) ? qdraw.signs.map((sign: string, idx: number) => ({
        local: `Partido ${idx + 1}`,
        visitor: '—',
        result: sign,
        fecha_completa: qdraw.fecha_completa ?? qdraw.fecha ?? '',
      })) : []);

  return (
    <article className="board-card quiniela-card">
      <div className="mini-head quiniela-head">
        <div className="mini-line">
          <span className="mini-label">Jornada</span>
          <span className="mini-value">{qdraw.jornada ?? '—'}</span>
        </div>
        <div className="mini-line">
          <span className="mini-label">Fecha</span>
          <span className="mini-value">{qdraw.fecha ? formatShortDate(qdraw.fecha) : '—'}</span>
        </div>
      </div>

      <div className="quiniela-list">
        {matches.map((match: { local: string; visitor: string; result: '1' | 'X' | '2' | null; fecha_completa?: string }, idx: number) => {
          const isPleno = idx === matches.length - 1;
          const dateText = match.fecha_completa ?? qdraw.fecha_completa ?? qdraw.fecha ?? '';

          return (
            <div
              key={`${game.code}-${idx}`}
              className={`quiniela-row ${isPleno ? 'quiniela-row--pleno' : ''}`}
            >
              <div className="quiniela-match-block">
                <span className="quiniela-match">
                  {cleanTeamName(match.local)} - {cleanTeamName(match.visitor)}
                  {isPleno && qdraw.plenoAl15 !== undefined && qdraw.plenoAl15 !== null && (
                    <span className="quiniela-pleno-label">Pleno</span>
                  )}
                </span>
                {dateText && <span className="quiniela-date-time">{formatMatchDateTime(dateText)}</span>}
              </div>
              {match.result ? (
                <span className={`quiniela-sign sign-${match.result}`}>{match.result}</span>
              ) : (
                <span className="quiniela-sign quiniela-sign--pending">
                  {dateText ? formatMatchTime(dateText) : '—'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
};
