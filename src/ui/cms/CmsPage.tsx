import { useCms } from '../../app/cms/hooks';
import { NavMenu } from '../components/NavMenu';
import { CmsGameForm } from './CmsGameForm';
import '../theme';
import './CmsPage.css';

/**
 * Route `/cms`: manual backup when SELAE fails. Open each game's request in a new tab, copy the
 * JSON, paste it and save: it goes to the same localStorage entry the board reads.
 */
export const CmsPage = () => {
  const { games, save } = useCms();

  return (
    <main className="cms-page">
      <div className="cms-page__content">
        <h1 className="cms-page__title">Carga manual de resultados</h1>
        <p className="cms-page__help">
          Abre la petición de cada juego con el icono de enlace, copia el JSON que devuelve, pégalo en su caja y
          pulsa Guardar. El tablero lo mostrará al momento.
        </p>
        {games.map((game) => (
          <CmsGameForm key={game.gameId} game={game} onSave={save} />
        ))}
      </div>
      <NavMenu floating />
    </main>
  );
};
