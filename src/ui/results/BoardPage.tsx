import { useBoardView } from '../../app/store/hooks';
import { NavMenu } from '../components/NavMenu';
import { StatusBar } from '../components/StatusBar';
import { Stage } from '../stage/Stage';
import { LiveUpcomingColumn } from '../upcoming/UpcomingColumn';
import { NumbersCard } from './NumbersCard';
import { QuinielaCard } from './QuinielaCard';
import { QuinigolCard } from './QuinigolCard';
import './BoardPage.css';

/**
 * Route `/`. Column 1: numbers games in a single column. Column 2: football. Column 3: upcoming draws.
 */
export const BoardPage = () => {
  const view = useBoardView();
  const [quiniela, quinigol] = view.football;

  return (
    <Stage>
      <main className="board-page">
        <section className="board-page__numbers">
          {view.numbers.map((card) => (
            <NumbersCard key={card.gameId} card={card} />
          ))}
        </section>
        <section className="board-page__football">
          {quiniela && <QuinielaCard card={quiniela} />}
          {quinigol && <QuinigolCard card={quinigol} />}
        </section>
        <div className="board-page__upcoming">
          <LiveUpcomingColumn />
        </div>
        <div className="board-page__status">
          <StatusBar {...view.status} start={<NavMenu />} />
        </div>
      </main>
    </Stage>
  );
};
