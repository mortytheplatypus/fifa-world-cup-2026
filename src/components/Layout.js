import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/groups" className="site-title">
          FIFA WC 2026
        </Link>
        <nav className="site-nav">
          <Link to="/groups">Groups</Link>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
