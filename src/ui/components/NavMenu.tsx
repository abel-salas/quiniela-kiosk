import { NavLink } from 'react-router-dom';
import { HomeIcon, SlidesIcon, WrenchIcon } from './icons';
import './NavMenu.css';

const LINKS = [
  { to: '/', label: 'Resultados', icon: <HomeIcon /> },
  { to: '/slide', label: 'Slides', icon: <SlidesIcon /> },
  { to: '/cms', label: 'Carga manual', icon: <WrenchIcon /> },
];

/**
 * Footer navigation of `/` and `/cms` (not on the tablet's `/slide`). `floating` pins it to the bottom-left corner of the
 * viewport; otherwise it sits inline (board status bar).
 */
export const NavMenu = ({ floating = false }: { floating?: boolean }) => (
  <nav className={floating ? 'nav-menu nav-menu--floating' : 'nav-menu'} aria-label="Navegación">
    {LINKS.map(({ to, label, icon }) => (
      <NavLink key={to} to={to} end className="nav-menu__link" title={label} aria-label={label}>
        {icon}
      </NavLink>
    ))}
  </nav>
);
