import { useId, useState } from 'react';
import type { CmsGameView, CmsSaveResult } from '../../app/cms/cms';
import type { ResultGameId } from '../../domain/games';
import { logoUrl } from '../assets/logos';
import { ExternalLinkIcon } from '../components/icons';

export interface CmsGameFormProps {
  game: CmsGameView;
  onSave(gameId: ResultGameId, text: string): CmsSaveResult;
}

/** One game: header with the link to the provider request, JSON box and save button. */
export const CmsGameForm = ({ game, onSave }: CmsGameFormProps) => {
  const inputId = useId();
  const [text, setText] = useState('');
  const [result, setResult] = useState<CmsSaveResult | null>(null);
  const imageUrl = logoUrl(game.logo);

  const save = () => {
    const saved = onSave(game.gameId, text);
    setResult(saved);
    if (saved.ok) setText('');
  };

  return (
    <section className="cms-game" data-game={game.gameId}>
      <header className="cms-game__header" style={{ backgroundColor: game.color }}>
        {imageUrl && <img className="cms-game__logo" src={imageUrl} alt="" />}
        <label className="cms-game__name" htmlFor={inputId}>{game.name}</label>
        <a
          className="cms-game__link"
          href={game.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir la petición de ${game.name} en una pestaña nueva`}
          aria-label={`Abrir la petición de ${game.name}`}
        >
          <ExternalLinkIcon />
        </a>
      </header>
      <p className="cms-game__status">{game.statusText}</p>
      <textarea
        id={inputId}
        className="cms-game__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Pega aquí el JSON de la petición"
        spellCheck={false}
        rows={4}
      />
      <div className="cms-game__actions">
        <button type="button" className="cms-game__save" onClick={save} disabled={text.trim() === ''}>
          Guardar
        </button>
        {result && (
          <span className={result.ok ? 'cms-game__message' : 'cms-game__message cms-game__message--error'} role="status">
            {result.message}
          </span>
        )}
      </div>
    </section>
  );
};
