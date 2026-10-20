import './SignBox.css';

export interface SignBoxProps {
  sign: string | null;
  color: string;
}

export const SignBox = ({ sign, color }: SignBoxProps) => (
  <span
    className={`sign-box${sign === null ? ' sign-box--empty' : ''}`}
    style={{ backgroundColor: sign === null ? 'white' : color, borderColor: color }}
    aria-label={sign ?? 'Sin resultado'}
  >
    {sign}
  </span>
);
