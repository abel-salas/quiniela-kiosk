import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  projectId: 'lkywbgau',
  dataset: 'production',
  title: 'Quiniela',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([S.documentTypeListItem('slide').title('Slides')]),
    }),
  ],
  schema: { types: schemaTypes },
});
