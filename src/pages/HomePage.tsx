import { BoardLayout } from '../components/layout/BoardLayout';
import { useLotteryBoard } from '../hooks/useLotteryBoard';

export const HomePage = () => {
  const { board } = useLotteryBoard();

  return <BoardLayout items={board} />;
};
