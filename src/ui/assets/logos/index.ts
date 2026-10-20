const LOGO_URLS = import.meta.glob<string>('./*.svg', { eager: true, query: '?url', import: 'default' });

/** URL of a local logo (`GAMES[id].logo`, `JOKER.svg`, `MILLON.svg`); never hot-linked from SELAE. */
export const logoUrl = (file: string): string | null => LOGO_URLS[`./${file}`] ?? null;
