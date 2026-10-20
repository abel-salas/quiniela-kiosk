export const decodeEntities = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  return value.replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (entity, hex: string | undefined, decimal: string | undefined) => {
    const codePoint = Number.parseInt(hex ?? decimal ?? '', hex ? 16 : 10);
    if (
      !Number.isInteger(codePoint)
      || codePoint < 0
      || codePoint > 0x10ffff
      || (codePoint >= 0xd800 && codePoint <= 0xdfff)
    ) {
      return entity;
    }
    return String.fromCodePoint(codePoint);
  });
};

export const cleanText = (value: unknown): string =>
  decodeEntities(value).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

export const cleanTeamName = (value: unknown): string =>
  cleanText(value).replace(/\s+\(m\)$/i, ' (M)');
