import { createClient } from '@sanity/client';

export type SanityQueryParams = Record<string, string>;

export interface SanityFetcher {
  fetch(query: string, params?: SanityQueryParams): Promise<unknown>;
}

export interface SanityConfig {
  projectId: string;
  dataset: string;
}

export const SANITY_API_VERSION = '2025-02-19';

/** Public dataset read without token; no CDN so Studio changes are visible immediately. */
export const createSanityClient = ({ projectId, dataset }: SanityConfig): SanityFetcher => {
  const client = createClient({ projectId, dataset, apiVersion: SANITY_API_VERSION, useCdn: false });
  return {
    fetch: (query, params = {}) => client.fetch<unknown>(query, params),
  };
};
