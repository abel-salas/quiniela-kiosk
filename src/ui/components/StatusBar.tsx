import './StatusBar.css';

export interface StatusBarProps {
  updatedText: string;
  notice: string;
}

export const StatusBar = ({ updatedText, notice }: StatusBarProps) => (
  <footer className="status-bar">
    <span className="status-bar__updated">{updatedText}</span>
    <span className="status-bar__notice">{notice}</span>
  </footer>
);
