export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);
