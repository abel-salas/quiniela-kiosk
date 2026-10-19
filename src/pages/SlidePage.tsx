import { Slider } from '../components/slider/Slider';
import { UpcomingSlide } from '../components/slider/UpcomingSlide';
import { SanitySlideComponent } from '../components/slider/SanitySlide';
import { useSlider } from '../hooks/useSlider';

export const SlidePage = () => {
  const { draws, slides, loading, error } = useSlider();

  const slideElements = [
    <UpcomingSlide key="upcoming" draws={draws} />,
    ...slides.map((slide) => <SanitySlideComponent key={slide._id} slide={slide} />),
  ];

  if (loading) {
    return (
      <main className="slide-shell">
        <div className="slide-content">
          <div className="loading-message">
            <div className="loading-dot"></div>
            <span>Cargando slides...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="slide-shell">
        <div className="slide-content">
          <div className="error-message">Error: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="slide-shell">
      <div className="slide-content">
        <Slider interval={10000}>
          {slideElements}
        </Slider>
      </div>
    </main>
  );
};
