import { defineConfig } from 'sanity';
import { schema } from './sanity/schemas';

export default defineConfig({
  projectId: 'lkywbgau',
  dataset: 'production',
  title: 'Quiniela',
  apiVersion: '2024-01-01',
  basePath: '/studio',
  schema,
});
