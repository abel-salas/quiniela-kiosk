import { AddOnBox, type AddOnBoxProps } from './AddOnBox';
import { BallRow } from './BallRow';
import { ExtraBall, type ExtraBallProps } from './ExtraBall';
import './DrawLine.css';

export interface DrawLineProps {
  dateText: string;
  balls: string[];
  color: string;
  extras: ExtraBallProps[];
  addOn?: AddOnBoxProps | null;
}

export const DrawLine = ({ dateText, balls, color, extras, addOn }: DrawLineProps) => (
  <div className="draw-line">
    <span className="draw-line__date">{dateText}</span>
    <BallRow values={balls} color={color} />
    <div className="draw-line__extras">
      {extras.map((extra, index) => <ExtraBall key={`${extra.label}-${index}`} {...extra} />)}
    </div>
    {addOn && <AddOnBox {...addOn} />}
  </div>
);
