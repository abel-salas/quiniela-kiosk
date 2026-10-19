import { LotteryIcon } from '../ui/LotteryIcon';
import { BonolotoCard } from '../cards/BonolotoCard';
import { PrimitivaCard } from '../cards/PrimitivaCard';
import { EuromillonesCard } from '../cards/EuromillonesCard';
import { GordoCard } from '../cards/GordoCard';
import { NacionalCard } from '../cards/NacionalCard';
import { QuinielaCard } from '../cards/QuinielaCard';
import type { LotteryBoardItem, GameCode } from '../../types/lottery';

export const BoardLayout = ({ items }: { items: LotteryBoardItem[] }) => {
  const gameMap = new Map<GameCode, LotteryBoardItem>(
    items.map((item) => [item.game.code, item]),
  );

  const renderLotteryCard = (boardItem: LotteryBoardItem) => {
    const { game } = boardItem;

    if (game.kind === 'quiniela') {
      return <QuinielaCard boardItem={boardItem} />;
    }

    if (game.kind === 'nacional') {
      return <NacionalCard boardItem={boardItem} />;
    }

    if (game.code === 'LAPR') {
      return <PrimitivaCard boardItem={boardItem} />;
    }

    if (game.kind === 'euromillones') {
      return <EuromillonesCard boardItem={boardItem} />;
    }

    if (game.kind === 'gordo') {
      return <GordoCard boardItem={boardItem} />;
    }

    if (game.code === 'BONO') {
      return <BonolotoCard boardItem={boardItem} />;
    }

    return null;
  };

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
          {renderGameSlot('BONO')}
          {renderGameSlot('LAPR')}
          {renderGameSlot('EMIL')}
        </section>

        <section className="board-right-stack">
          {renderGameSlot('ELGR')}
          {renderGameSlot('LNAC')}
          {renderGameSlot('LAQU')}
        </section>
      </div>
    </main>
  );
};
