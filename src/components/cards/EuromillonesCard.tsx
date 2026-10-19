import type { LotteryBoardItem } from '../../types/lottery';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

export const EuromillonesCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw, game } = boardItem;
  const history = ((boardItem as any).history ?? [draw]) as any[];
  const euroRows = history
    .slice(-2)
    .map((entry: any) => {
      const edraw = entry as any;
      const drawDate = edraw.date || edraw.scheduledDate || '';
      return {
        day: drawDate ? new Date(`${drawDate}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase() : 'SORTEO',
        date: drawDate ? formatShortDate(drawDate) : '—',
        numbers: Array.isArray(edraw.numbers) ? edraw.numbers : [],
        stars: Array.isArray(edraw.stars) ? edraw.stars : [],
      };
    });

  return (
    <article className="board-card euro-card">
      <div className="bonoloto-days-list">
        {euroRows.map((slot, index) => (
          <div key={`${game.code}-row-${index}`} className="bonoloto-day-row">
            <span className="bonoloto-day-name">{slot.date} - {slot.day}</span>
            <div className="bonoloto-day-main">
              <div className="bonoloto-day-numbers">
                {slot.numbers.length > 0 && slot.numbers.map((number: number, idx: number) => (
                  <span key={`euro-num-${slot.day}-${number}-${idx}`} className="bonoloto-ball">{number}</span>
                ))}
              </div>
              <div className="bonoloto-day-meta">
                {slot.stars.length > 0 && (
                  <span className="bonoloto-meta-item">
                    <span className="bonoloto-meta-text">Estrellas</span>
                    <span className="bonoloto-meta-number-group">
                      {slot.stars.map((star: number, idx: number) => (
                        <span key={`euro-star-${slot.day}-${star}-${idx}`} className="bonoloto-meta-number">{star}</span>
                      ))}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
