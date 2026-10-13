import { useEffect, useMemo, useState } from 'react';
import { fallbackBoard } from './mock/fixtures';
import { fetchBoard, getLastUpdated } from './api/service';
import type { GameCode, LotteryBoardItem } from './types';

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

const getCurrentWeekDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, idx) => {
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
};

const getWeekDayEntry = (weekDay: string) => {
  const week = getCurrentWeekDates();
  return week.find((entry) => entry.weekDay === weekDay.toUpperCase()) ?? week[0];
};

const NumberStrip = ({ values, tone = 'yellow' }: { values: Array<number | string>; tone?: 'yellow' | 'blue' }) => (
  <div className="number-strip">
    {(values ?? []).map((value, idx) => (
      <span key={`${value}-${idx}`} className={`ball ${tone}`}>{value}</span>
    ))}
  </div>
);

const LotteryIcon = ({ code }: { code: GameCode }) => {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
  } as const;

  switch (code) {
    case 'BONO':
      return (
        <svg {...commonProps} className="game-icon">
          <circle cx="12" cy="12" r="8" fill="#f5d447" />
          <circle cx="12" cy="12" r="3.5" fill="#0b2c7a" />
        </svg>
      );
    case 'ELGR':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M7 18h10l-1.2-8.8L12 5l-3.8 4.2L7 18Z" fill="#f5d447" />
          <path d="M9.5 11.5h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'LAPR':
      return (
        <svg {...commonProps} className="game-icon">
          <circle cx="12" cy="12" r="8" fill="#f5d447" />
          <circle cx="12" cy="12" r="3" fill="#0b2c7a" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'EMIL':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M12 2.5 14.7 8l5.8.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 8.9l5.8-.9L12 2.5Z" fill="#f5d447" />
        </svg>
      );
    case 'LNAC':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M7 17.5h10l-1-8.5L12 4.5 8 9l-1 8.5Z" fill="#f5d447" />
          <path d="M9.5 13.2h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="12" cy="11" r="1.5" fill="#0b2c7a" />
        </svg>
      );
    case 'LAQU':
      return (
        <svg {...commonProps} className="game-icon">
          <rect x="4" y="5" width="16" height="14" rx="2" fill="#f5d447" />
          <path d="M8 10h8M8 14h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="17" cy="14" r="1.5" fill="#0b2c7a" />
        </svg>
      );
    default:
      return null;
  }
};

const renderLotteryCard = (boardItem: LotteryBoardItem) => {
  const { draw, game } = boardItem;

  if (game.kind === 'quiniela') {
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
          {matches.map((match: { local: string; visitor: string; result: '1' | 'X' | '2'; fecha_completa?: string }, idx: number) => {
            const isPleno = idx === matches.length - 1;
            const dateText = match.fecha_completa ?? qdraw.fecha_completa ?? qdraw.fecha ?? '';

            return (
              <div
                key={`${game.code}-${idx}`}
                className={`quiniela-row ${isPleno ? 'quiniela-row--pleno' : ''}`}
              >
                <div className="quiniela-match-block">
                  <span className="quiniela-match">
                    {match.local} - {match.visitor}
                    {isPleno && qdraw.plenoAl15 !== undefined && qdraw.plenoAl15 !== null && (
                      <span className="quiniela-pleno-label">Pleno</span>
                    )}
                  </span>
                  {dateText && <span className="quiniela-date-time">{formatMatchDateTime(dateText)}</span>}
                </div>
                <span className={`quiniela-sign sign-${match.result}`}>{match.result}</span>
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  if (game.kind === 'nacional') {
    const ndraw = draw as any;
    return (
      <article className="board-card nacional-card">
        <div className="nacional-row">
          <span className="mini-label">1.er Premio</span>
          <span className="big-value">{ndraw.primerPremio ?? '—'}</span>
          <span className="mini-label">2.º Premio</span>
          <span className="big-value">{ndraw.segundoPremio ?? '—'}</span>
        </div>
        <div className="nacional-row">
          <span className="mini-label">Reintegros</span>
          <span className="mini-value slim">{(ndraw.reintegros ?? []).join(', ') || '—'}</span>
        </div>
      </article>
    );
  }

  if (game.code === 'LAPR') {
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
  }

  if (game.kind === 'euromillones') {
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
  }

  if (game.kind === 'gordo') {
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
  }

  if (game.code === 'BONO') {
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
  }

  const numbers = (draw as any).numbers ?? [];

  return (
    <article className="board-card standard-card">
      <div className="mini-head compact">
        <span className="mini-label">Día</span>
        <span className="mini-value">{formatShortDate(draw.date || '')}</span>
      </div>
      <NumberStrip values={numbers} tone="yellow" />
      <div className="bonus-row">
        {(draw as any).complementario !== undefined && <span className="pill">Comp. {(draw as any).complementario}</span>}
        {(draw as any).reintegro !== undefined && <span className="pill">Reint. {(draw as any).reintegro}</span>}
        {(() => {
          const jokerValue = (draw as any).joker && typeof (draw as any).joker === 'object'
            ? (draw as any).joker.combinacion
            : (draw as any).joker;
          return jokerValue !== undefined && jokerValue !== null && jokerValue !== '' && (
            <span className="pill">JOKER {jokerValue}</span>
          );
        })()}
      </div>
    </article>
  );
};

function App() {
  const [items, setItems] = useState<LotteryBoardItem[]>(fallbackBoard);
  const [updatedAt, setUpdatedAt] = useState(getLastUpdated());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const next = await fetchBoard();
        setItems((prev) => (next.length > 0 ? next : prev));
      } catch {
        setItems((prev) => prev);
      } finally {
        setUpdatedAt(getLastUpdated());
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const board = useMemo(() => items, [items]);

  const leftGameCodes: GameCode[] = ['BONO', 'ELGR', 'LAPR'];
  const rightGameCodes: GameCode[] = ['LAQU'];

  const gameMap = new Map<GameCode, LotteryBoardItem>(
    board.map((item) => [item.game.code, item]),
  );

  const renderGameSlot = (code: GameCode, className = '') => {
    const item = gameMap.get(code);

    if (!item) {
      return (
        <div key={`empty-${code}`} className={`board-item empty-slot ${className}`}>
          <div className="game-title-row">
            <span className="game-icon-wrap"><LotteryIcon code={code} /></span>
            <span className="game-name empty-name">{code}</span>
          </div>
          <div className="board-card empty-card">
            <div className="placeholder-line" />
            <div className="placeholder-line short" />
            <div className="placeholder-line" />
          </div>
        </div>
      );
    }

    const { game } = item;
    return (
      <div key={game.code} className={`board-item ${className}`}>
        <div className="game-title-row">
          <span className="game-icon-wrap"><LotteryIcon code={game.code} /></span>
          <span className="game-name">{game.label}</span>
        </div>
        {renderLotteryCard(item)}
      </div>
    );
  };

  return (
    <main className="board-shell">
      <header className="top-bar">
        <div className="title">RESULTADOS</div>
      </header>

      <div className="board-layout">
        <section className="board-left-stack">
          <div className="mini-panel mini-panel--bono">
            {renderGameSlot('BONO', 'left-slot')}
          </div>
          <div className="mini-panel mini-panel--euromillones">
            {renderGameSlot('EMIL', 'center-slot')}
          </div>
          <div className="mini-panel mini-panel--gordo">
            {renderGameSlot('ELGR', 'left-slot')}
          </div>
          <div className="mini-panel mini-panel--primitiva">
            {renderGameSlot('LAPR', 'left-slot')}
          </div>
        </section>

        <aside className="board-column right-column">
          {rightGameCodes.map((code) => renderGameSlot(code, 'quiniela-box'))}
        </aside>
      </div>

      <footer className="footer-bar">
        <span>Última actualización: {updatedAt}</span>
        <span className="notice">Resultados informativos; compruebe su boleto en el terminal.</span>
        {loading && <span className="loading-dot" />}
      </footer>
      <div className="admin-footer">Administració de Loteria Nº 1 de Malgrat de Mar</div>
    </main>
  );
}

export default App;
