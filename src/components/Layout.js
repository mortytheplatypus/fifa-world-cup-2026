import { useCallback, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import FavoriteTeamBanner from './FavoriteTeamBanner';
import MobileHeaderMenu from './MobileHeaderMenu';
import SettingsButton from './SettingsButton';
import TimezoneSelector from './TimezoneSelector';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((open) => !open);
  }, []);

  return (
    <div className="layout">
      <FavoriteTeamBanner />
      <header className="site-header">
        <Link to="/" className="site-brand">
          <img
            src="/fifawc2026logo.png"
            alt=""
            className="site-logo"
            width={36}
            height={36}
          />
          <span className="site-brand-text">
            <span className="site-title">FIFA World Cup 2026</span>
            <span className="site-subtitle">USA · Canada · Mexico</span>
          </span>
        </Link>

        <nav className="site-nav site-nav--desktop" aria-label="Main navigation">
          <NavLink to="/" end className="site-nav-link">
            Home
          </NavLink>
          <NavLink to="/groups" className="site-nav-link">
            Groups
          </NavLink>
          <NavLink to="/fixtures" className="site-nav-link">
            Fixtures
          </NavLink>
          <NavLink to="/tables" className="site-nav-link">
            Tables
          </NavLink>
          <NavLink to="/knockout" className="site-nav-link">
            Knockout
          </NavLink>
        </nav>

        <div className="site-header-right site-header-right--desktop">
          <TimezoneSelector />
          <SettingsButton />
        </div>

        <MobileHeaderMenu
          isOpen={isMobileMenuOpen}
          onToggle={toggleMobileMenu}
          onClose={closeMobileMenu}
        />
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
