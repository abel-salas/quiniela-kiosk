/**
 * `#rrggbb` → `rgba(r, g, b, alpha)`. Replaces CSS `color-mix()`, which needs Chrome 111+;
 * over the white card the result looks the same.
 */
export const withAlpha = (hex: string, alpha: number): string => {
  const match = hex.trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return hex;
  const [red, green, blue] = match.slice(1).map((part) => Number.parseInt(part, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
