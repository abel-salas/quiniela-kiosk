import { Route, Routes } from 'react-router-dom';
import type { Clock } from './app/clock';
import type { SlideStore } from './app/slides/slide-store';
import { SlideStoreContext } from './app/slides/hooks';
import type { BoardStore } from './app/store/board-store';
import { BoardStoreContext, ClockContext } from './app/store/hooks';
import { BoardPage } from './ui/results/BoardPage';
import { SlidePage } from './ui/slides/SlidePage';

export interface AppProps {
  store: BoardStore;
  slides: SlideStore;
  clock: Clock;
}

function App({ store, slides, clock }: AppProps) {
  return (
    <BoardStoreContext.Provider value={store}>
      <SlideStoreContext.Provider value={slides}>
        <ClockContext.Provider value={clock}>
          <Routes>
            <Route path="/" element={<BoardPage />} />
            <Route path="/quini" element={<BoardPage />} />
            <Route path="/slide" element={<SlidePage />} />
          </Routes>
        </ClockContext.Provider>
      </SlideStoreContext.Provider>
    </BoardStoreContext.Provider>
  );
}

export default App;
