import type { LotteryBoardItem } from '../../types/lottery';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

const getWeekDayEntry = (weekDay: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  const week = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);

    if (date > today) {
      date.setDate(date.getDate() - 7);
    }

    return {
      date,
      weekDay: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date).toUpperCase(),
      dateLabel: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date),
    };
  });

  return week.find((entry) => entry.weekDay === weekDay.toUpperCase()) ?? week[0];
};

export const GordoCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw, game } = boardItem;
  const history = ((boardItem as any).history ?? [draw]) as any[];
  const gordoRows = history
    .slice(-2)
    .map((entry: any) => {
      const gdraw = entry as any;
      const drawDate = gdraw.date || gdraw.scheduledDate || '';
      return {
        day: drawDate ? new Date(`${drawDate}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase() : 'DOMINGO',
        date: drawDate ? formatShortDate(drawDate) : getWeekDayEntry('DOMINGO').dateLabel,
        numbers: gdraw.numbers ?? [27, 2, 3, 20, 41],
        reintegro: gdraw.reintegro ?? 8,
        clave: gdraw.clave ?? 'G5',
      };
    });

  return (
    <article className="board-card gordo-card">
      {gordoRows.map((gordoRow, index) => (
        <div key={`${game.code}-row-${index}`} className="bonoloto-day-row">
          <span className="bonoloto-day-name">{gordoRow.date} - {gordoRow.day}</span>
          <div className="bonoloto-day-main">
            <div className="bonoloto-day-numbers">
              {gordoRow.numbers.map((number: number, idx: number) => (
                <span key={`gordo-${number}-${idx}`} className="bonoloto-ball">{number}</span>
              ))}
            </div>
            <div className="bonoloto-day-meta">
              <span className="bonoloto-meta-item">
                <span className="bonoloto-meta-text">Reint.</span>
                <span className="bonoloto-meta-number">{gordoRow.reintegro}</span>
              </span>
              <span className="bonoloto-meta-item gordo-meta-item">
                <span className="bonoloto-meta-text">CLAVE</span>
                <span className="bonoloto-meta-number gordo-meta-number">{gordoRow.clave}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </article>
  );
};
