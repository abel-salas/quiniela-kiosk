import type { LotteryBoardItem } from '../../types/lottery';

export const NacionalCard = ({ boardItem }: { boardItem: LotteryBoardItem }) => {
  const { draw } = boardItem;
  const ndraw = draw as any;

  return (
    <article className="board-card nacional-card">
      <div className="nacional-row">
        <span className="mini-label">1.er Premio</span>
        <span className="big-value">{ndraw.primerPremio ?? '—'}</span>
        <span className="mini-label">2.º Premio</span>
        <span className="big-value">{ndraw.segundoPremio ?? '—'}</span>
      </div>
      <div className="nacional-row">
        <span className="mini-label">Reintegros</span>
        <span className="big-value slim">{(ndraw.reintegros ?? []).join(', ') || '—'}</span>
      </div>
    </article>
  );
};
