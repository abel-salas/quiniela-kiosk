export const NumberStrip = ({ values, tone = 'yellow' }: { values: Array<number | string>; tone?: 'yellow' | 'blue' }) => (
  <div className="number-strip">
    {(values ?? []).map((value, idx) => (
      <span key={`${value}-${idx}`} className={`ball ${tone}`}>{value}</span>
    ))}
  </div>
);
