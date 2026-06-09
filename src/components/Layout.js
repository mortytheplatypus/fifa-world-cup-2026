import { Link, NavLink, Outlet } from 'react-router-dom';
import TimezoneSelector from './TimezoneSelector';
import VisitorCounter from './VisitorCounter';

function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header-left">
          <Link to="/groups" className="site-brand">
            <img
              src="/fifawc2026logo.png"
              alt=""
              className="site-logo"
              width={36}
              height={36}
            />
            <span className="site-title">FIFA World Cup 2026</span>
          </Link>
          <nav className="site-nav">
            <NavLink to="/groups" className="site-nav-link">
              Groups
            </NavLink>
            <NavLink to="/fixtures" className="site-nav-link">
              Fixtures
            </NavLink>
          </nav>
        </div>
        <div className="site-header-right">
          <TimezoneSelector />
          <VisitorCounter />
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
