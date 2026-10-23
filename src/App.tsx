import { Route, Routes } from 'react-router-dom';
import type { CmsService } from './app/cms/cms';
import { CmsContext } from './app/cms/hooks';
import type { Clock } from './app/clock';
import type { SlideStore } from './app/slides/slide-store';
import { SlideStoreContext } from './app/slides/hooks';
import type { BoardStore } from './app/store/board-store';
import { BoardStoreContext, ClockContext } from './app/store/hooks';
import { CmsPage } from './ui/cms/CmsPage';
import { BoardPage } from './ui/results/BoardPage';
import { SlidePage } from './ui/slides/SlidePage';

export interface AppProps {
  store: BoardStore;
  slides: SlideStore;
  cms: CmsService;
  clock: Clock;
}

function App({ store, slides, cms, clock }: AppProps) {
  return (
    <BoardStoreContext.Provider value={store}>
      <SlideStoreContext.Provider value={slides}>
        <CmsContext.Provider value={cms}>
          <ClockContext.Provider value={clock}>
            <Routes>
              <Route path="/" element={<BoardPage />} />
              <Route path="/slide" element={<SlidePage />} />
              <Route path="/cms" element={<CmsPage />} />
            </Routes>
          </ClockContext.Provider>
        </CmsContext.Provider>
      </SlideStoreContext.Provider>
    </BoardStoreContext.Provider>
  );
}

export default App;
