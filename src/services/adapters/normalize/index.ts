import type { GameCode, LotteryDraw } from '../../../types/lottery';

const normalizeQuinielaSign = (raw: string): '1' | 'X' | '2' | null => {
  const value = String(raw ?? '').trim().toUpperCase();

  // Si no hay valor explícito, devolver null (no mostrar signo)
  if (!value || value === '') {
    return null;
  }

  if (value === '1' || value === 'X' || value === '2') {
    return value as '1' | 'X' | '2';
  }

  if (value.includes('-')) {
    const [local, visitor] = value.split('-').map((part) => Number(part));
    if (Number.isNaN(local) || Number.isNaN(visitor)) return null;
    if (local > visitor) return '1';
    if (local < visitor) return '2';
    return 'X';
  }

  return null;
};

const parseCombination = (value: unknown) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return { numbers: [], complementario: undefined, reintegro: undefined };
  }

  const match = text.match(/^(.*?)(?:\s*C\((\d+)\))?(?:\s*R\((\d+)\))?$/i);
  const numbersText = match?.[1] ?? text;
  const numbers = numbersText
    .split('-')
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));

  return {
    numbers,
    complementario: match?.[2] !== undefined ? Number(match[2]) : undefined,
    reintegro: match?.[3] !== undefined ? Number(match[3]) : undefined,
  };
};

const getDateFromPayload = (payload: any) => payload?.fecha_sorteo?.slice(0, 10)
  ?? payload?.fecha ?? payload?.date ?? '';

const parseJokerValue = (value: unknown): number | number[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => parseJokerValue(entry))
      .filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry));
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const digits = value.replace(/\D+/g, '');
    return digits ? Number(digits) : undefined;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const nested = obj.combinacion ?? obj.joker ?? obj.numero ?? obj.value ?? obj.id;
    return parseJokerValue(nested);
  }

  return undefined;
};

export const normalizeDraw = (payload: any, game: GameCode): LotteryDraw => {
  switch (game) {
    case 'BONO': {
      const combo = parseCombination(payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '');
      const drawDate = getDateFromPayload(payload);
      return {
        id: payload.id ?? `${game}-${drawDate || 'unknown'}`,
        game,
        date: drawDate,
        scheduledDate: drawDate,
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        combinacion: payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '',
        combinacionActa: payload.combinacion_acta ?? payload.combinacion ?? payload.combo ?? '',
        numbers: combo.numbers.length > 0 ? combo.numbers : Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        complementario: combo.complementario ?? (payload.complementario !== undefined ? Number(payload.complementario) : undefined),
        reintegro: combo.reintegro ?? (payload.reintegro !== undefined ? Number(payload.reintegro) : undefined),
      };
    }
    case 'ELGR': {
      const combo = parseCombination(payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '');
      const drawDate = getDateFromPayload(payload);
      return {
        id: payload.id ?? `${game}-${drawDate || 'unknown'}`,
        game,
        date: drawDate,
        scheduledDate: drawDate,
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        combinacion: payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '',
        combinacionActa: payload.combinacion_acta ?? payload.combinacion ?? payload.combo ?? '',
        numbers: combo.numbers.length > 0 ? combo.numbers : Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        reintegro: payload.reintegro !== undefined ? Number(payload.reintegro) : undefined,
        clave: payload.clave ?? payload.clavePremio,
      };
    }
    case 'LAPR': {
      const combo = parseCombination(payload.combinacion ?? payload.combinacion_acta ?? payload.joker?.combinacion ?? payload.combo ?? '');
      const drawDate = getDateFromPayload(payload);
      const jokerValue = payload.joker && typeof payload.joker === 'object'
        ? payload.joker.combinacion ?? payload.joker.numero ?? payload.joker.value ?? ''
        : payload.joker ?? payload.combinacion ?? payload.combinacion_acta ?? '';
      return {
        id: payload.id ?? `${game}-${drawDate || 'unknown'}`,
        game,
        date: drawDate,
        scheduledDate: drawDate,
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        combinacion: payload.combinacion ?? payload.combinacion_acta ?? payload.joker?.combinacion ?? payload.combo ?? '',
        combinacionActa: payload.combinacion_acta ?? payload.combinacion ?? payload.joker?.combinacion ?? payload.combo ?? '',
        numbers: combo.numbers.length > 0 ? combo.numbers : Array.isArray(payload.numeros) ? payload.numeros.map(Number) : [],
        complementario: combo.complementario ?? (payload.complementario !== undefined ? Number(payload.complementario) : undefined),
        reintegro: combo.reintegro ?? (payload.reintegro !== undefined ? Number(payload.reintegro) : undefined),
        joker: jokerValue,
      };
    }
    case 'EMIL': {
      const drawDate = getDateFromPayload(payload);
      const comboText = String(payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '').trim();
      const allTokens = comboText.match(/\d+/g)?.map(Number) ?? [];
      const numbers = Array.isArray(payload.numeros)
        ? payload.numeros.map(Number)
        : allTokens.slice(0, 5);
      const stars = Array.isArray(payload.estrellas)
        ? payload.estrellas.map(Number)
        : allTokens.length > 5
          ? allTokens.slice(5, 7)
          : [];

      return {
        id: payload.id ?? `${game}-${drawDate || 'unknown'}`,
        game,
        date: drawDate,
        scheduledDate: drawDate,
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        combinacion: payload.combinacion ?? payload.combinacion_acta ?? payload.combo ?? '',
        combinacionActa: payload.combinacion_acta ?? payload.combinacion ?? payload.combo ?? '',
        numbers: numbers.length > 0 ? numbers : [],
        stars: stars.length > 0 ? stars : [],
      };
    }
    case 'LNAC':
      return {
        id: payload.id ?? `${game}-${payload.fecha ?? 'unknown'}`,
        game,
        date: payload.fecha ?? payload.date ?? '',
        scheduledDate: payload.fecha ?? payload.date ?? '',
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        primerPremio: typeof payload.primerPremio === 'object' ? payload.primerPremio.decimo : payload.primerPremio ?? payload.premio1,
        segundoPremio: typeof payload.segundoPremio === 'object' ? payload.segundoPremio.decimo : payload.segundoPremio ?? payload.premio2,
        reintegros: Array.isArray(payload.reintegros)
          ? payload.reintegros.map((r: any) => typeof r === 'object' ? r.decimo : r)
          : [],
      };
    case 'LAQU': {
      const matches: Array<{ local: string; visitor: string; result: '1' | 'X' | '2' | null; fecha_completa?: string }> = Array.isArray(payload.partidos)
        ? payload.partidos.map((partido: any) => ({
            local: String(partido.local ?? '').replace(/\s*\(m\)\s*$/i, '').trim(),
            visitor: String(partido.visitante ?? '').replace(/\s*\(m\)\s*$/i, '').trim(),
            result: normalizeQuinielaSign(partido.signo ?? ''),
            fecha_completa: partido.fecha_completa ?? partido.fecha ?? partido.hora ?? '',
          }))
        : [];

      const signs = matches.length > 0
        ? matches.map((match: { result: '1' | 'X' | '2' | null }) => match.result).filter((r): r is '1' | 'X' | '2' => r !== null)
        : Array.isArray(payload.signos)
          ? payload.signos
          : Array.isArray(payload.signs)
            ? payload.signs
            : [];

      const drawDate = payload.fecha_sorteo?.slice(0, 10)
        ?? payload.fecha ?? payload.date ?? '';
      const fullDate = payload.fecha_completa ?? payload.fecha ?? payload.fecha_sorteo ?? payload.date ?? '';

      return {
        id: payload.id ?? `${game}-${drawDate || 'unknown'}`,
        game,
        date: drawDate,
        scheduledDate: drawDate,
        status: payload.estado === 'celebrado' || payload.celebrado ? 'celebrado' : 'pendiente',
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
        jornada: Number(payload.jornada ?? payload.numero ?? 0),
        fecha: drawDate,
        fecha_completa: fullDate,
        signs: signs as Array<'1' | 'X' | '2'>,
        matches: matches.length > 0 ? matches : undefined,
        plenoAl15: payload.plenoAl15 ?? payload.pleno ?? payload.escrutinio?.find((entry: any) => String(entry.tipo ?? '').toLowerCase().includes('pleno al 15'))?.ganadores ?? '',
      };
    }
    default:
      throw new Error(`Game not supported: ${game}`);
  }
};
