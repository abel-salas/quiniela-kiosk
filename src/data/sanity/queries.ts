export const DRAWS_QUERY =
  '*[_type == "lotteryDraw" && game == $game && date >= $from && date <= $to] | order(date asc)';

export const FORCED_GAMES_QUERY = '*[_id == "kioskSettings"][0].forcedGames';

export const SLIDES_QUERY =
  '*[_type == "slide" && active != false && defined(image.asset)] | order(order asc) { _id, title, order, "imageUrl": image.asset->url }';
