import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { createCmsService } from '../../app/cms/cms';
import { CmsContext } from '../../app/cms/hooks';
import { createEntryCache, createMemoryStorage } from '../../app/store/entry-cache';
import { selaeImporter } from '../../data/selae/importer';
import { CmsPage } from './CmsPage';

const render = () => {
  const cms = createCmsService({
    importer: selaeImporter,
    cache: createEntryCache(createMemoryStorage()),
    clock: { now: () => new Date(2026, 9, 14, 22, 0) },
  });
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/cms']}>
      <CmsContext.Provider value={cms}>
        <CmsPage />
      </CmsContext.Provider>
    </MemoryRouter>,
  );
};

describe('CmsPage', () => {
  const html = render();

  it('renders one form per result game, without the jackpots', () => {
    expect(html.split('class="cms-game"').length - 1).toBe(7);
    expect(html.split('<textarea').length - 1).toBe(7);
    expect(html).toContain('La Quiniela');
    expect(html).toContain('EuroDreams');
  });

  it('links each game to its SELAE request in a new tab', () => {
    expect(html).toContain('href="https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LAQU');
    expect(html.split('target="_blank" rel="noopener noreferrer"').length - 1).toBe(7);
  });

  it('shows the navigation menu', () => {
    expect(html).toContain('nav-menu nav-menu--floating');
  });
});
