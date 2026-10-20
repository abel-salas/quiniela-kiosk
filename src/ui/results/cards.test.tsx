import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { selectBoardView } from '../../app/selectors/results';
import { createInitialSnapshot, withGame } from '../../app/store/snapshot';
import { FIXTURE_NOW, fixtureSnapshot } from '../../test/fixture-board';
import { NumbersCard } from './NumbersCard';
import { QuinielaCard } from './QuinielaCard';
import { QuinigolCard } from './QuinigolCard';

const view = selectBoardView(fixtureSnapshot(), FIXTURE_NOW);
const numbers = (id: string) => {
  const card = view.numbers.find((item) => item.gameId === id);
  if (!card) throw new Error(`Missing card ${id}`);
  return card;
};
const count = (html: string, text: string) => html.split(text).length - 1;

describe('NumbersCard', () => {
  it('renders one draw line per draw of the week', () => {
    const html = renderToStaticMarkup(<NumbersCard card={numbers('BONO')} />);
    expect(count(html, 'class="draw-line"')).toBe(3);
    expect(html).toContain('Bonoloto');
    expect(html).toContain('miércoles 14/10');
    expect(html).not.toContain('result-card__empty');
  });

  it('renders the Joker and Millón boxes', () => {
    expect(renderToStaticMarkup(<NumbersCard card={numbers('LAPR')} />)).toContain('4 781 884');
    expect(renderToStaticMarkup(<NumbersCard card={numbers('EMIL')} />)).toContain('GRF94523');
  });

  it('renders the pending text and the awaiting badge', () => {
    const snapshot = withGame(withGame(createInitialSnapshot(), 'BONO', { phase: 'awaitingResult' }), 'BONO', { draws: [] });
    const card = selectBoardView(snapshot, FIXTURE_NOW).numbers[0];
    const html = renderToStaticMarkup(<NumbersCard card={card} />);
    expect(html).toContain('Pendiente de resultado');
    expect(html).toContain('Resultado de hoy pendiente');
    expect(html).not.toContain('class="draw-line"');
  });
});

describe('QuinielaCard', () => {
  const html = renderToStaticMarkup(<QuinielaCard card={view.football[0]} />);

  it('renders 15 matches with the jornada and the provisional badge', () => {
    expect(count(html, '<div class="match-row')).toBe(15);
    expect(html).toContain('Jornada 13ª');
    expect(html).toContain('PROVISIONAL');
    expect(html).toContain('Villarreal (M) - Nápoles (M)');
  });

  it('labels the 15th match as Pleno al 15 and shows its kickoff', () => {
    expect(count(html, 'Pleno al 15')).toBe(1);
    expect(html).toContain('match-row--highlight');
    expect(html).toContain('mié 21:00');
  });
});

describe('QuinigolCard', () => {
  it('renders 6 matches with the result in the sign box', () => {
    const html = renderToStaticMarkup(<QuinigolCard card={view.football[1]} />);
    expect(count(html, '<div class="match-row')).toBe(6);
    expect(html).toContain('M-1');
    expect(html).not.toContain('Pleno al 15');
  });
});
