import { BoardLayout } from '../components/layout/BoardLayout';
import { useSanityBoard } from '../hooks/useSanityBoard';

export const QuiniPage = () => {
  const { board, loading, error } = useSanityBoard();

  if (loading) {
    return (
      <main className="board-shell">
        <header className="top-bar">
          <div className="title">QUINIELA</div>
        </header>
        <div className="board-layout">
          <div className="loading-message">Cargando resultados...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="board-shell">
        <header className="top-bar">
          <div className="title">QUINIELA</div>
        </header>
        <div className="board-layout">
          <div className="error-message">Error: {error}</div>
        </div>
      </main>
    );
  }

  return <BoardLayout items={board} />;
};
