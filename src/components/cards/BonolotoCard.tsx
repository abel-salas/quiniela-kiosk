import type { LotteryBoardItem } from '../../types/lottery';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

export const BonolotoCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw, game } = boardItem;
  const history = ((boardItem as any).history ?? [draw]) as any[];
  const bonoRows = history
    .slice(-7)
    .map((entry: any) => {
      const bonoDraw = entry as any;
      const drawDate = bonoDraw.date || bonoDraw.scheduledDate || '';
      return {
        day: drawDate ? new Date(`${drawDate}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase() : 'SORTEO',
        date: drawDate ? formatShortDate(drawDate) : '—',
        numbers: Array.isArray(bonoDraw.numbers) ? bonoDraw.numbers : [],
        complementario: bonoDraw.complementario,
        reintegro: bonoDraw.reintegro,
      };
    });

  return (
    <article className="board-card bonoloto-card">
      <div className="bonoloto-days-list">
        {bonoRows.map((slot, index) => (
          <div key={`${game.code}-row-${index}`} className="bonoloto-day-row">
            <span className="bonoloto-day-name">{slot.date} - {slot.day}</span>
            <div className="bonoloto-day-main">
              <div className="bonoloto-day-numbers">
                {slot.numbers.map((number: number, idx: number) => (
                  <span key={`${slot.day}-${number}-${idx}`} className="bonoloto-ball">{number}</span>
                ))}
              </div>
              <div className="bonoloto-day-meta">
                {slot.complementario !== undefined && (
                  <span className="bonoloto-meta-item"><span className="bonoloto-meta-text">Comp.</span> <span className="bonoloto-meta-number">{slot.complementario}</span></span>
                )}
                {slot.reintegro !== undefined && (
                  <span className="bonoloto-meta-item"><span className="bonoloto-meta-text">Reint.</span> <span className="bonoloto-meta-number">{slot.reintegro}</span></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
