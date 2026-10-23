export const SLIDES_QUERY =
  '*[_type == "slide" && active != false && defined(image.asset)] | order(order asc) { _id, title, order, "imageUrl": image.asset->url }';
