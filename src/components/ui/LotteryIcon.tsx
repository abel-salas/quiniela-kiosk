import type { GameCode } from '../../types/lottery';

export const LotteryIcon = ({ code }: { code: GameCode }) => {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
  } as const;

  switch (code) {
    case 'BONO':
      return (
        <svg {...commonProps} className="game-icon">
          <circle cx="12" cy="12" r="8" fill="#f5d447" />
          <circle cx="12" cy="12" r="3.5" fill="#0b2c7a" />
        </svg>
      );
    case 'ELGR':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M7 18h10l-1.2-8.8L12 5l-3.8 4.2L7 18Z" fill="#f5d447" />
          <path d="M9.5 11.5h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'LAPR':
      return (
        <svg {...commonProps} className="game-icon">
          <circle cx="12" cy="12" r="8" fill="#f5d447" />
          <circle cx="12" cy="12" r="3" fill="#0b2c7a" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'EMIL':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M12 2.5 14.7 8l5.8.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 8.9l5.8-.9L12 2.5Z" fill="#f5d447" />
        </svg>
      );
    case 'LNAC':
      return (
        <svg {...commonProps} className="game-icon">
          <path d="M7 17.5h10l-1-8.5L12 4.5 8 9l-1 8.5Z" fill="#f5d447" />
          <path d="M9.5 13.2h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="12" cy="11" r="1.5" fill="#0b2c7a" />
        </svg>
      );
    case 'LAQU':
      return (
        <svg {...commonProps} className="game-icon">
          <rect x="4" y="5" width="16" height="14" rx="2" fill="#f5d447" />
          <path d="M8 10h8M8 14h5" stroke="#0b2c7a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="17" cy="14" r="1.5" fill="#0b2c7a" />
        </svg>
      );
    default:
      return null;
  }
};
