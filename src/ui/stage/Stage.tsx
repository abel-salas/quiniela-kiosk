import { useEffect, useState, type ReactNode } from 'react';
import '../theme';
import './Stage.css';

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export const computeStageScale = (width: number, height: number): number =>
  width > 0 && height > 0 ? Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT) : 1;

const readWindowScale = (): number =>
  typeof window === 'undefined' ? 1 : computeStageScale(window.innerWidth, window.innerHeight);

/** Fixed 1920×1080 canvas scaled to fit the screen and centred. Inside it, sizes are in px. */
export const Stage = ({ children }: { children: ReactNode }) => {
  const [scale, setScale] = useState(readWindowScale);

  useEffect(() => {
    const onResize = () => setScale(readWindowScale());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="stage">
      <div className="stage__canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
};
