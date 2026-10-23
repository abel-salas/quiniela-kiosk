import { useLocation } from 'react-router-dom';
import { HomeIcon, SlidesIcon, WrenchIcon } from './icons';
import './NavMenu.css';

const LINKS = [
  { to: '/', label: 'Resultados', icon: <HomeIcon /> },
  { to: '/slide', label: 'Slides', icon: <SlidesIcon /> },
  { to: '/cms', label: 'Carga manual', icon: <WrenchIcon /> },
];

/**
 * Footer navigation of `/` and `/cms` (not on the tablet's `/slide`). Plain links on purpose: each
 * route starts its own store in `main.tsx`, so moving between them is a full page load.
 * `floating` pins it to the bottom-left corner of the viewport; otherwise it sits inline.
 */
export const NavMenu = ({ floating = false }: { floating?: boolean }) => {
  const { pathname } = useLocation();
  return (
    <nav className={floating ? 'nav-menu nav-menu--floating' : 'nav-menu'} aria-label="Navegación">
      {LINKS.map(({ to, label, icon }) => {
        const active = pathname === to;
        return (
          <a
            key={to}
            href={to}
            className={active ? 'nav-menu__link active' : 'nav-menu__link'}
            aria-current={active ? 'page' : undefined}
            title={label}
            aria-label={label}
          >
            {icon}
          </a>
        );
      })}
    </nav>
  );
};
