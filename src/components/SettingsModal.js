import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { fetchTeams, getTeamDisplayName } from '../utils/data';
import { THEME_OPTIONS } from '../utils/themes';
import VisitorCounter from './VisitorCounter';

const THEME_LABELS = {
  [THEME_OPTIONS.DARK]: 'Dark',
  [THEME_OPTIONS.LIGHT]: 'Light',
  [THEME_OPTIONS.TEAM]: 'Favorite Team',
};

function SettingsModal({ onClose }) {
  const {
    theme,
    setTheme,
    favoriteTeamId,
    setFavoriteTeamId,
    isModalOpen,
  } = useSettings();
  const [teams, setTeams] = useState([]);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    fetchTeams()
      .then((data) => {
        if (!cancelled) {
          setTeams([...data].sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTeams([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const mobileMediaQuery = window.matchMedia('(max-width: 960px)');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    function handleClickOutside(event) {
      if (dialogRef.current?.contains(event.target)) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest('.settings-dropdown')
      ) {
        return;
      }

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLSelectElement &&
        dialogRef.current?.contains(activeElement)
      ) {
        return;
      }

      onClose();
    }

    document.addEventListener('keydown', handleKeyDown);

    let clickListenerId;
    if (!mobileMediaQuery.matches) {
      clickListenerId = window.setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    closeButtonRef.current?.focus();

    return () => {
      if (clickListenerId !== undefined) {
        window.clearTimeout(clickListenerId);
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="settings-modal-header">
          <h2 id="settings-modal-title" className="settings-modal-title">
            Settings
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-modal-body">
          <label className="settings-field">
            <span className="settings-field-label">Theme</span>
            <select
              className="settings-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {Object.entries(THEME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span className="settings-field-label">Favorite Team</span>
            <select
              className="settings-select"
              value={favoriteTeamId ?? ''}
              onChange={(event) => setFavoriteTeamId(event.target.value)}
              disabled={teams.length === 0}
            >
              <option value="" disabled>
                Choose a team
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamDisplayName(team.name)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="settings-modal-footer">
          <VisitorCounter />
        </div>
      </div>
  );
}

SettingsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SettingsModal;
