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
  const query = `*[_type == "slide"] | order(order asc)`;
  return sanityClient.fetch(query);
};
