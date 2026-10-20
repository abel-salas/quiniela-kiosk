import { useSlideRotation, useSlides } from '../../app/slides/hooks';
import '../theme';
import './SlidePage.css';

/** Tablet route: full-screen Sanity images rotating with a cross-fade. Black screen without slides. */
export const SlidePage = () => {
  const slides = useSlides();
  const active = useSlideRotation(slides);

  return (
    <main className="slide-page">
      {slides.map((slide, index) => (
        <img
          key={slide.key}
          className={`slide-page__image${index === active ? ' slide-page__image--active' : ''}`}
          src={slide.imageUrl}
          alt={slide.alt}
        />
      ))}
    </main>
  );
};
