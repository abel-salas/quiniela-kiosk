export interface ParsedCombination {
  tokens: string[];
  c: string | null;
  r: string | null;
}

const EXTRA_PATTERN = /\s+([CR])\s*\(\s*(\d+)\s*\)\s*$/i;

export const parseCombination = (value: unknown): ParsedCombination | null => {
  if (typeof value !== 'string') return null;

  let remaining = value.trim();
  if (!remaining) return null;

  let c: string | null = null;
  let r: string | null = null;
  let extra = remaining.match(EXTRA_PATTERN);

  while (extra) {
    const kind = extra[1].toUpperCase();
    const extraValue = extra[2];
    if ((kind === 'C' && c !== null) || (kind === 'R' && r !== null)) return null;
    if (kind === 'C') c = extraValue;
    else r = extraValue;
    remaining = remaining.slice(0, remaining.length - extra[0].length).trimEnd();
    extra = remaining.match(EXTRA_PATTERN);
  }

  if (/(?:^|\s)[CR]\s*\(/i.test(remaining)) return null;
  const tokens = remaining.split(/\s+-\s+/).map((token) => token.trim());
  if (tokens.length === 0 || tokens.some((token) => !token)) return null;

  return { tokens, c, r };
};
