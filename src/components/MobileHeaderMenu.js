import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import SettingsButton from './SettingsButton';
import TimezoneSelector from './TimezoneSelector';

function MenuIcon({ isOpen }) {
  return (
    <svg
      className="site-menu-toggle-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isOpen ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

MenuIcon.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

function MobileHeaderMenu({ isOpen, onToggle, onClose }) {
  const toggleRef = useRef(null);
  const menuPanelRef = useRef(null);
  const location = useLocation();
  const { isModalOpen, closeModal } = useSettings();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      closeModal();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, closeModal]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 960px)');

    const handleViewportChange = (event) => {
      if (!event.matches) {
        onClose();
      }
    };

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isModalOpen) {
        onClose();
        toggleRef.current?.focus();
      }
    };

    const handlePointerDown = (event) => {
      if (isModalOpen) {
        return;
      }

      const target = event.target;

      if (toggleRef.current?.contains(target)) {
        return;
      }

      if (menuPanelRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    const pointerListenerId = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true);
    }, 0);

    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(pointerListenerId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.body.style.overflow = '';
    };
  }, [isOpen, isModalOpen, onClose]);

  return (
    <>
      <div
        className={`site-header-mobile${isModalOpen ? ' is-settings-open' : ''}`}
      >
        <button
          ref={toggleRef}
          type="button"
          className="site-menu-toggle"
          onClick={onToggle}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="site-mobile-menu"
          hidden={isModalOpen}
        >
          <MenuIcon isOpen={isOpen} />
        </button>
      </div>

      {isOpen && (
        <button
          type="button"
          className="site-mobile-menu-backdrop"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      {isOpen && (
        <div
          ref={menuPanelRef}
          id="site-mobile-menu"
          className="site-mobile-menu-panel is-open"
        >
          <nav className="site-mobile-nav" aria-label="Main navigation">
            <NavLink to="/" end className="site-mobile-nav-link" onClick={onClose}>
              Home
            </NavLink>
            <NavLink to="/groups" className="site-mobile-nav-link" onClick={onClose}>
              Groups
            </NavLink>
            <NavLink to="/fixtures" className="site-mobile-nav-link" onClick={onClose}>
              Fixtures
            </NavLink>
            <NavLink to="/tables" className="site-mobile-nav-link" onClick={onClose}>
              Tables
            </NavLink>
            <NavLink to="/knockout" className="site-mobile-nav-link" onClick={onClose}>
              Knockout
            </NavLink>
          </nav>

          <div className="site-mobile-menu-actions">
            <TimezoneSelector />
            <SettingsButton />
          </div>
        </div>
      )}
    </>
  );
}

MobileHeaderMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MobileHeaderMenu;
