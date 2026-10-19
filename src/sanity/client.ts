import { createClient } from '@sanity/client';

const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN,
  organizationId: import.meta.env.VITE_SANITY_ORGANIZATION_ID,
};

export const sanityClient = createClient(sanityConfig);
