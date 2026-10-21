import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Zoom } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useSlides } from '../../app/slides/hooks';
import '../theme';
import './SlidePage.css';
import 'swiper/css';
import 'swiper/css/zoom';

/** Tablet route: full-screen Sanity images with touch swipe, zoom, autoplay (15s) and progress bar. */
export const SlidePage = () => {
  const slides = useSlides();
  const swiperRef = useRef<SwiperType | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.autoplay.start();
    }
  }, [slides]);

  if (slides.length === 0) {
    return <main className="slide-page slide-page--empty" />;
  }

  return (
    <main className="slide-page">
      <Swiper
        modules={[Autoplay, Zoom]}
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1}
        autoplay={{
          delay: 15000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: false,
        }}
        zoom={{
          maxRatio: 3,
          minRatio: 1,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onAutoplayTimeLeft={(_swiper, _timeLeft, percentage) => {
          setProgress(percentage * 100);
        }}
        onAutoplay={(_swiper) => {
          setProgress(100);
        }}
        className="slide-page__swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key} className="slide-page__slide">
            <div className="swiper-zoom-container">
              <img src={slide.imageUrl} alt={slide.alt} className="slide-page__image" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="slide-page__progress-bar">
        <div className="slide-page__progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </main>
  );
};
