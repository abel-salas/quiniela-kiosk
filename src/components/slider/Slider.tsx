import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface SliderProps {
  children: ReactNode[];
  interval?: number; // Intervalo en milisegundos (default: 10000ms = 10s)
}

export const Slider = ({ children, interval = 10000 }: SliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (children.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, interval);

    return () => clearInterval(timer);
  }, [children.length, interval]);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return <>{children[0]}</>;
  }

  return (
    <div className="slider-container">
      {children.map((child, index) => (
        <div
          key={index}
          className={`slider-slide ${index === currentIndex % children.length ? 'slider-slide--active' : ''}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
