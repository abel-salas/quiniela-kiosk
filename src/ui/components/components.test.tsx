import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AddOnBox } from './AddOnBox';
import { Ball } from './Ball';
import { BallRow } from './BallRow';
import { DrawLine } from './DrawLine';
import { ExtraBall } from './ExtraBall';
import { GameHeader } from './GameHeader';
import { MatchRow } from './MatchRow';
import { SignBox } from './SignBox';
import { StatusBar } from './StatusBar';
import { UpcomingTile } from './UpcomingTile';

describe('base UI components', () => {
  it('renders the branded game header and optional date', () => {
    const html = renderToStaticMarkup(<GameHeader name="Bonoloto" logo="BONO.svg" color="#7a8634" dateText="lun - 19/10/2026" />);
    expect(html).toContain('Bonoloto');
    expect(html).toContain('lun - 19/10/2026');
    expect(html).toContain('game-header__logo');
  });

  it('renders solid and soft balls plus a ball row', () => {
    expect(renderToStaticMarkup(<Ball value="04" color="#008547" variant="soft" />)).toContain('ball--soft');
    expect(renderToStaticMarkup(<BallRow values={['04', '18']} color="#008547" />)).toContain('18');
  });

  it('renders labeled extras, add-ons, and draw lines', () => {
    expect(renderToStaticMarkup(<ExtraBall label="C" value="23" color="#008547" variant="soft" />)).toContain('23');
    expect(renderToStaticMarkup(<AddOnBox logo="JOKER.svg" value="2 240 325" />)).toContain('2 240 325');
    const html = renderToStaticMarkup(
      <DrawLine
        dateText="lun 19/10"
        balls={['04', '18']}
        color="#008547"
        extras={[{ label: 'C', value: '23', color: '#008547', variant: 'soft' }]}
      />,
    );
    expect(html).toContain('lun 19/10');
    expect(html).toContain('Combinación');
  });

  it('renders filled and empty signs and match rows', () => {
    expect(renderToStaticMarkup(<SignBox sign={null} color="#cb1517" />)).toContain('Sin resultado');
    const html = renderToStaticMarkup(
      <MatchRow position={15} home="Real Madrid (M)" away="Villarreal (M)" detail="1-0" sign="1-0" color="#cb1517" highlight />,
    );
    expect(html).toContain('Real Madrid (M) - Villarreal (M)');
    expect(html).toContain('match-row--highlight');
  });

  it('renders upcoming tiles and the status bar', () => {
    const tile = renderToStaticMarkup(
      <UpcomingTile
        name="EuroDreams"
        logo="EDMS.svg"
        color="#6e368c"
        amount="20.000 €"
        note="al mes durante 30 años"
        countdown="3h 19m"
      />,
    );
    expect(tile).toContain('20.000 €');
    expect(tile).toContain('3h 19m');
    const status = renderToStaticMarkup(<StatusBar updatedText="Actualizado 21:30" notice="Consulte resultados oficiales" />);
    expect(status).toContain('Consulte resultados oficiales');
  });
});
