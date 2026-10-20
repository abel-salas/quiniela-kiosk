import { defineArrayMember, defineField, defineType } from 'sanity';
import { exactLengthFor, hiddenUnless, requiredFor, RESULT_GAME_OPTIONS } from './game-fields';
import { matchesField } from './matches-field';

export const lotteryDraw = defineType({
  name: 'lotteryDraw',
  title: 'Sorteo',
  type: 'document',
  fields: [
    defineField({
      name: 'game',
      title: 'Juego',
      type: 'string',
      options: { list: RESULT_GAME_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Fecha del sorteo',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'numbers',
      title: 'Números',
      type: 'array',
      of: [defineArrayMember({ type: 'number', validation: (rule) => rule.integer() })],
      hidden: hiddenUnless(['BONO', 'LAPR', 'EDMS', 'ELGR', 'EMIL']),
      validation: (rule) =>
        rule.custom(exactLengthFor({ BONO: 6, LAPR: 6, EDMS: 6, ELGR: 5, EMIL: 5 })),
    }),
    defineField({
      name: 'complementario',
      title: 'Complementario',
      type: 'number',
      hidden: hiddenUnless(['BONO', 'LAPR']),
      validation: (rule) => rule.integer(),
    }),
    defineField({
      name: 'reintegro',
      title: 'Reintegro',
      type: 'number',
      hidden: hiddenUnless(['BONO', 'LAPR']),
      validation: (rule) => rule.integer().min(0).max(9),
    }),
    defineField({
      name: 'joker',
      title: 'Joker',
      type: 'string',
      hidden: hiddenUnless(['LAPR']),
      validation: (rule) => rule.regex(/^\d{7}$/, { name: '7 dígitos' }),
    }),
    defineField({
      name: 'clave',
      title: 'Número clave',
      type: 'number',
      hidden: hiddenUnless(['ELGR']),
      validation: (rule) => rule.integer().min(0).max(9),
    }),
    defineField({
      name: 'estrellas',
      title: 'Estrellas',
      type: 'array',
      of: [defineArrayMember({ type: 'number', validation: (rule) => rule.integer() })],
      hidden: hiddenUnless(['EMIL']),
      validation: (rule) => rule.custom(exactLengthFor({ EMIL: 2 })),
    }),
    defineField({
      name: 'millon',
      title: 'El Millón',
      type: 'string',
      hidden: hiddenUnless(['EMIL']),
    }),
    defineField({
      name: 'sueno',
      title: 'Número sueño',
      type: 'number',
      hidden: hiddenUnless(['EDMS']),
      validation: (rule) => rule.integer(),
    }),
    defineField({
      name: 'jornada',
      title: 'Jornada',
      type: 'number',
      hidden: hiddenUnless(['LAQU', 'QGOL']),
      validation: (rule) => rule.integer().custom(requiredFor(['LAQU', 'QGOL'])),
    }),
    defineField({
      name: 'finalizada',
      title: 'Jornada finalizada',
      type: 'boolean',
      initialValue: false,
      hidden: hiddenUnless(['LAQU', 'QGOL']),
    }),
    matchesField,
  ],
  preview: {
    select: { game: 'game', date: 'date' },
    prepare: ({ game, date }: { game?: string; date?: string }) => ({
      title: `${game ?? '—'} · ${date ?? '—'}`,
    }),
  },
});
