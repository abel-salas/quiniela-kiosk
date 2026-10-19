import { sanityClient } from './client';
import type { SanityLotteryDraw, SanitySlide } from '../types/sanity';

export const fetchAllLotteryDraws = async (): Promise<SanityLotteryDraw[]> => {
  const query = `*[_type == "lotteryDraw"] | order(date desc)`;
  return sanityClient.fetch(query);
};

export const fetchLotteryDrawByGame = async (game: string): Promise<SanityLotteryDraw[]> => {
  const query = `*[_type == "lotteryDraw" && game == $game] | order(date desc)`;
  return sanityClient.fetch(query, { game });
};

export const fetchSlides = async (): Promise<SanitySlide[]> => {
  const query = `*[_type == "slide" && defined(image.asset)] | order(order asc) {
    _id,
    _type,
    title,
    order,
    "image": image.asset->url
  }`;
  return sanityClient.fetch(query);
};
