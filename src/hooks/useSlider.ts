import { useEffect, useState } from 'react';
import { useUpcomingDraws } from './useUpcomingDraws';
import { fetchSlides } from '../sanity/queries';
import type { SanitySlide } from '../types/sanity';

export const useSlider = () => {
  const { draws, loading: drawsLoading, error: drawsError } = useUpcomingDraws();
  const [slides, setSlides] = useState<SanitySlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [slidesError, setSlidesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const sanitySlides = await fetchSlides();
        if (isMounted) {
          setSlides(sanitySlides);
        }
      } catch (err) {
        console.error('Error loading Sanity slides:', err);
        if (isMounted) {
          setSlidesError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setSlidesLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  const loading = drawsLoading || slidesLoading;
  const error = drawsError || slidesError;

  return {
    draws,
    slides,
    loading,
    error,
  };
};
