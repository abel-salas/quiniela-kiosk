import type { UpcomingTileView } from '../../app/selectors/types';
import { useUpcomingTiles } from '../../app/store/hooks';
import { UpcomingTile } from '../components/UpcomingTile';
import './UpcomingColumn.css';

export const UPCOMING_TITLE = 'Próximos sorteos';

/** Column 3: one tile per game, in API order, sharing the full height. */
export const UpcomingColumn = ({ tiles }: { tiles: UpcomingTileView[] }) => (
  <aside className="upcoming-column">
    <h2 className="upcoming-column__title">{UPCOMING_TITLE}</h2>
    <div className="upcoming-column__tiles">
      {tiles.map(({ key, ...tile }) => (
        <UpcomingTile key={key} {...tile} />
      ))}
    </div>
  </aside>
);

/** Reads the board store; countdowns tick every minute. */
export const LiveUpcomingColumn = () => <UpcomingColumn tiles={useUpcomingTiles()} />;
