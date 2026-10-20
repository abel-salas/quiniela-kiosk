import { defineArrayMember, defineField } from 'sanity';
import { exactLengthFor, hiddenUnless } from './game-fields';

export const matchesField = defineField({
  name: 'matches',
  title: 'Partidos',
  description: 'En orden: 15 en La Quiniela (el 15 es el pleno al 15), 6 en El Quinigol',
  type: 'array',
  hidden: hiddenUnless(['LAQU', 'QGOL']),
  validation: (rule) => rule.custom(exactLengthFor({ LAQU: 15, QGOL: 6 })),
  of: [
    defineArrayMember({
      name: 'match',
      title: 'Partido',
      type: 'object',
      fields: [
        defineField({
          name: 'home',
          title: 'Local',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'away',
          title: 'Visitante',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({ name: 'kickoff', title: 'Fecha y hora', type: 'datetime' }),
        defineField({ name: 'score', title: 'Marcador', description: 'Ej.: 3-1', type: 'string' }),
        defineField({
          name: 'sign',
          title: 'Signo',
          description: 'Ej.: 1, X, 2, 1-0, M-2. Vacío si no se ha jugado',
          type: 'string',
        }),
      ],
      preview: {
        select: { home: 'home', away: 'away', sign: 'sign' },
        prepare: ({ home, away, sign }: { home?: string; away?: string; sign?: string }) => ({
          title: `${home ?? '—'} – ${away ?? '—'}`,
          subtitle: sign,
        }),
      },
    }),
  ],
});
