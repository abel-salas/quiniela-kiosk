import { logoUrl } from '../assets/logos';
import './AddOnBox.css';

export interface AddOnBoxProps {
  logo: string;
  value: string;
}

export const AddOnBox = ({ logo, value }: AddOnBoxProps) => {
  const imageUrl = logoUrl(logo);

  return (
    <div className="add-on-box">
      {imageUrl && <img className="add-on-box__logo" src={imageUrl} alt="" />}
      <span className="add-on-box__value">{value}</span>
    </div>
  );
};
