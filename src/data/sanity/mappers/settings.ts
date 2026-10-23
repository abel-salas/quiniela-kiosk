import type { Slide } from '../../../domain/slide';
import { isRecord, optionalText } from '../parse';

export const mapSlide = (value: unknown): Slide | null => {
  if (!isRecord(value)) return null;
  const id = typeof value._id === 'string' ? value._id.trim() : '';
  const imageUrl = typeof value.imageUrl === 'string' ? value.imageUrl.trim() : '';
  const title = optionalText(value.title);
  const { order } = value;
  if (!id || !imageUrl || title === undefined || typeof order !== 'number' || !Number.isFinite(order)) {
    return null;
  }
  return { id, title, imageUrl, order };
};

export const mapSlides = (value: unknown): Slide[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(mapSlide)
    .filter((slide): slide is Slide => slide !== null)
    .sort((a, b) => a.order - b.order);
};
