import type { LotteryBoardItem } from '../../types/lottery';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

export const PrimitivaCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw, game } = boardItem;
  const history = ((boardItem as any).history ?? [draw]) as any[];
  const primitivaRows = history
    .map((entry: any) => {
      const loteriaDraw = entry as any;
      const drawDate = loteriaDraw.date || loteriaDraw.scheduledDate || '';
      const jokerRaw = loteriaDraw.joker;
      const jokerDisplay = (() => {
        if (jokerRaw && typeof jokerRaw === 'object') {
          return String((jokerRaw as any).combinacion ?? '');
        }
        if (typeof jokerRaw === 'number' && Number.isFinite(jokerRaw)) {
          return String(jokerRaw);
        }
        if (typeof jokerRaw === 'string') {
          return jokerRaw;
        }
        if (Array.isArray(jokerRaw)) {
          return jokerRaw
            .map((value) => (typeof value === 'number' && Number.isFinite(value) ? String(value) : String(value ?? '').replace(/\D+/g, '')))
            .filter(Boolean)
            .join(', ');
        }
        return '';
      })();

      return {
        day: drawDate ? new Date(`${drawDate}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase() : 'SORTEO',
        date: drawDate ? formatShortDate(drawDate) : '—',
        numbers: Array.isArray(loteriaDraw.numbers) ? loteriaDraw.numbers : [],
        complementario: loteriaDraw.complementario,
        reintegro: loteriaDraw.reintegro,
        joker: jokerDisplay,
      };
    });

  return (
    <article className="board-card bonoloto-card">
      <div className="bonoloto-days-list">
        {primitivaRows.map((slot, index) => (
          <div key={`${game.code}-row-${index}`} className="bonoloto-day-row">
            <span className="bonoloto-day-name">{slot.date} - {slot.day}</span>
            <div className="bonoloto-day-main">
              <div className="bonoloto-day-numbers">
                {slot.numbers.length > 0 && slot.numbers.map((number: number, idx: number) => (
                  <span key={`lapr-num-${slot.day}-${number}-${idx}`} className="bonoloto-ball">{number}</span>
                ))}
              </div>
              <div className="bonoloto-day-meta">
                {slot.complementario !== undefined && (
                  <span className="bonoloto-meta-item">
                    <span className="bonoloto-meta-text">Comp.</span>
                    <span className="bonoloto-meta-number">{slot.complementario}</span>
                  </span>
                )}
                {slot.reintegro !== undefined && (
                  <span className="bonoloto-meta-item">
                    <span className="bonoloto-meta-text">Reint.</span>
                    <span className="bonoloto-meta-number">{slot.reintegro}</span>
                  </span>
                )}
                {slot.joker && (
                  <span className="bonoloto-meta-item primitiva-meta-item combination-pill">
                    <span className="bonoloto-meta-text">JOKER</span>
                    <span className="bonoloto-meta-number primitiva-meta-number">{slot.joker}</span>
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
