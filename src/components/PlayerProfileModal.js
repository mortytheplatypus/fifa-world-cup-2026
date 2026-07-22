import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { playerShape, teamShape } from '../propTypes';
import { getTeamDisplayName } from '../utils/data';
import PlayerAvatar from './PlayerAvatar';
import PlayerStats from './PlayerStats';

const POSITION_LABELS = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayerProfileModal({ player, team, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="player-profile-overlay" onClick={onClose}>
      <div
        className="player-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-profile-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="player-profile-header">
          <p className="player-profile-eyebrow">Player profile</p>
          <button
            ref={closeButtonRef}
            type="button"
            className="player-profile-close"
            onClick={onClose}
            aria-label="Close player profile"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="player-profile-hero">
          <PlayerAvatar player={player} team={team} size="large" showNumber={false} />

          <div className="player-profile-hero-body">
            <div className="player-profile-heading">
              <div className="player-profile-heading-text">
                {team && (
                  <div className="player-profile-team">
                    <img
                      className="player-profile-flag"
                      src={`https://flagcdn.com/w80/${team.flagCode}.png`}
                      alt=""
                      width={48}
                      height={36}
                    />
                    <span>{getTeamDisplayName(team.name)}</span>
                  </div>
                )}

                <h2 id="player-profile-title" className="player-profile-name">
                  {player.name}
                </h2>

                <p className="player-profile-subtitle">
                  {POSITION_LABELS[player.position] ?? player.position}
                  {player.club && ` · ${player.club}`}
                </p>
              </div>

              {player.shirtNumber != null && (
                <span
                  className="player-profile-number"
                  aria-label={`Shirt number ${player.shirtNumber}`}
                >
                  {player.shirtNumber}
                </span>
              )}
            </div>

            <PlayerStats player={player} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

PlayerProfileModal.propTypes = {
  player: playerShape.isRequired,
  team: teamShape,
  onClose: PropTypes.func.isRequired,
};

export default PlayerProfileModal;
