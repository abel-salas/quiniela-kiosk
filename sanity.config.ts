import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { KIOSK_SETTINGS_ID, schemaTypes } from './sanity/schemas';

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  projectId: 'lkywbgau',
  dataset: 'production',
  title: 'Quiniela',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            S.listItem()
              .title('Ajustes del kiosko')
              .id(KIOSK_SETTINGS_ID)
              .child(S.document().schemaType('kioskSettings').documentId(KIOSK_SETTINGS_ID)),
            S.divider(),
            S.documentTypeListItem('lotteryDraw').title('Sorteos'),
            S.documentTypeListItem('slide').title('Slides'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => schemaType !== 'kioskSettings'),
  },
  document: {
    actions: (actions, { schemaType }) =>
      schemaType === 'kioskSettings'
        ? actions.filter(({ action }) => action !== undefined && SINGLETON_ACTIONS.has(action))
        : actions,
  },
});
