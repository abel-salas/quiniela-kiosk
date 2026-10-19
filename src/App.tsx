import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { QuiniPage } from './pages/QuiniPage';
import { SlidePage } from './pages/SlidePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quini" element={<QuiniPage />} />
      <Route path="/slide" element={<SlidePage />} />
    </Routes>
  );
}

export default App;
