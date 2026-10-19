import { useUpcomingDraws } from '../hooks/useUpcomingDraws';
import { UpcomingDrawCard } from '../components/slider/UpcomingDrawCard';

export const SlidePage = () => {
  const { draws, loading, error } = useUpcomingDraws();

  return (
    <main className="slide-shell">
      <div className="slide-content">
        <header className="top-bar">
          <div className="title">PRÓXIMOS SORTEOS</div>
        </header>

        {loading && (
          <div className="loading-message">
            <div className="loading-dot"></div>
            <span>Cargando próximos sorteos...</span>
          </div>
        )}

        {error && (
          <div className="error-message">Error: {error}</div>
        )}

        {!loading && !error && (
          <div className="upcoming-grid">
            {draws.length > 0 ? (
              draws.map((draw) => (
                <UpcomingDrawCard key={draw.id_sorteo} draw={draw} />
              ))
            ) : (
              <div className="empty-message">
                No hay próximos sorteos disponibles
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
