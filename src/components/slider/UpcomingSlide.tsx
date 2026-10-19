import { UpcomingDrawCard } from './UpcomingDrawCard';
import type { UpcomingDraw } from '../../types/lottery';

interface UpcomingSlideProps {
  draws: UpcomingDraw[];
}

export const UpcomingSlide = ({ draws }: UpcomingSlideProps) => {
  return (
    <div className="upcoming-slide">
      <header className="top-bar">
        <div className="title">PRÓXIMOS SORTEOS</div>
      </header>
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
    </div>
  );
};
