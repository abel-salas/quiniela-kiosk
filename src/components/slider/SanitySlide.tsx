import type { SanitySlide } from '../../types/sanity';

interface SanitySlideProps {
  slide: SanitySlide;
}

export const SanitySlideComponent = ({ slide }: SanitySlideProps) => {
  return (
    <div className="sanity-slide">
      {slide.image && (
        <img
          src={slide.image}
          alt={slide.title || 'Slide'}
          className="sanity-slide__image"
        />
      )}
      {slide.title && (
        <div className="sanity-slide__title">{slide.title}</div>
      )}
    </div>
  );
};
