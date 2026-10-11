import { useEffect, useMemo, useState } from 'react';
import { fallbackBoard } from './mock/fixtures';
import { fetchBoard, getLastUpdated } from './api/service';
import type { LotteryBoardItem } from './types';

const formatShortDate = (date: string) => {
  if (!date) return '—';
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  } catch {
    return date;
  }
};

const NumberStrip = ({ values, tone = 'yellow' }: { values: Array<number | string>; tone?: 'yellow' | 'blue' }) => (
  <div className="number-strip">
    {(values ?? []).map((value, idx) => (
      <span key={`${value}-${idx}`} className={`ball ${tone}`}>{value}</span>
    ))}
  </div>
);

const renderLotteryCard = (boardItem: LotteryBoardItem) => {
  const { draw, game } = boardItem;

  if (game.kind === 'quiniela') {
    const qdraw = draw as any;
    const signs = Array.isArray(qdraw.signs) ? qdraw.signs : ['1', 'X', '2'];
    return (
      <article className="board-card quiniela-card">
        <div className="mini-head">
          <span className="mini-label">Jornada</span>
          <span className="mini-value">{qdraw.jornada ?? '—'}</span>
          <span className="mini-label">Fecha</span>
          <span className="mini-value">{qdraw.fecha ? formatShortDate(qdraw.fecha) : '—'}</span>
        </div>
        <div className="quiniela-grid">
          {signs.map((sign: string, idx: number) => (
            <div key={`${game.code}-${idx}`} className={`quiniela-cell sign-${sign}`}>{sign}</div>
          ))}
        </div>
        <div className="mini-foot">
          <span className="mini-label">Pleno al 15</span>
          <span className="mini-value strong">{qdraw.plenoAl15 ?? '—'}</span>
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

  if (game.kind === 'euromillones') {
    const edraw = draw as any;
    return (
      <article className="board-card euro-card">
        <div className="mini-head compact">
          <span className="mini-label">Números</span>
          <NumberStrip values={edraw.numbers ?? []} tone="yellow" />
        </div>
        <div className="mini-head compact">
          <span className="mini-label">Estrellas</span>
          <NumberStrip values={edraw.stars ?? []} tone="blue" />
        </div>
      </article>
    );
  }

  if (game.kind === 'gordo') {
    const gdraw = draw as any;
    return (
      <article className="board-card gordo-card">
        <div className="mini-head compact">
          <span className="mini-label">Día</span>
          <span className="mini-value">{formatShortDate(gdraw.date || '')}</span>
          <span className="mini-label">Reint.</span>
          <span className="mini-value">{gdraw.reintegro ?? '—'}</span>
        </div>
        <NumberStrip values={gdraw.numbers ?? []} tone="yellow" />
        <div className="mini-foot">
          <span className="mini-label">Clave</span>
          <span className="mini-value strong">{gdraw.clave ?? '—'}</span>
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
        {(draw as any).joker !== undefined && <span className="pill">Joker {(draw as any).joker}</span>}
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
        setItems(next);
      } catch {
        setItems(fallbackBoard);
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

  const leftGames = board.filter(({ game }) => ['BONO', 'ELGR', 'LAPR'].includes(game.code));
  const centerGames = board.filter(({ game }) => ['EMIL', 'LNAC'].includes(game.code));
  const rightGames = board.filter(({ game }) => game.code === 'LAQU');

  return (
    <main className="board-shell">
      <header className="top-bar">
        <div className="title">RESULTADOS</div>
      </header>

      <div className="board-layout">
        <div className="board-layout__main">
          <section className="board-column left-column">
            {leftGames.map(({ game, draw }) => (
              <div key={game.code} className="board-item">
                <div className="game-name">{game.label}</div>
                {renderLotteryCard({ game, draw })}
              </div>
            ))}
          </section>

          <section className="board-column center-column">
            {centerGames.map(({ game, draw }) => (
              <div key={game.code} className="board-item">
                <div className="game-name">{game.label}</div>
                {renderLotteryCard({ game, draw })}
              </div>
            ))}
          </section>
        </div>

        <aside className="board-layout__aside">
          {rightGames.map(({ game, draw }) => (
            <div key={game.code} className="board-item quiniela-box">
              <div className="game-name">{game.label}</div>
              {renderLotteryCard({ game, draw })}
            </div>
          ))}
        </aside>
      </div>

      <footer className="footer-bar">
        <span>Última actualización: {updatedAt}</span>
        <span className="notice">Resultados informativos; compruebe su boleto en el terminal.</span>
        {loading && <span className="loading-dot" />}
      </footer>
    </main>
  );
}

export default App;
