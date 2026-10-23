import type { ReactNode } from 'react';
import './StatusBar.css';

export interface StatusBarProps {
  updatedText: string;
  notice: string;
  /** Left slot, before the update time (navigation menu). */
  start?: ReactNode;
}

export const StatusBar = ({ updatedText, notice, start }: StatusBarProps) => (
  <footer className="status-bar">
    <span className="status-bar__start">
      {start}
      <span className="status-bar__updated">{updatedText}</span>
    </span>
    <span className="status-bar__notice">{notice}</span>
  </footer>
);
