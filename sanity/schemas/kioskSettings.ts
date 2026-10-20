import { defineArrayMember, defineField, defineType } from 'sanity';
import { RESULT_GAME_OPTIONS } from './game-fields';

export const KIOSK_SETTINGS_ID = 'kioskSettings';

export const kioskSettings = defineType({
  name: 'kioskSettings',
  title: 'Ajustes del kiosko',
  type: 'document',
  fields: [
    defineField({
      name: 'forcedGames',
      title: 'Juegos forzados',
      description: 'Juegos que la pantalla leerá de Sanity aunque la web oficial funcione',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: RESULT_GAME_OPTIONS },
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Ajustes del kiosko' }),
  },
});
