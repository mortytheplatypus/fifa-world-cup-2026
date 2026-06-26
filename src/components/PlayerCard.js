import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { playerShape } from '../propTypes';
import { getPlayerPath } from '../utils/data';

function PlayerCard({ player, compact = false }) {
  return (
    <Link
      to={getPlayerPath(player)}
      className={`player-card${compact ? ' player-card--compact' : ''}`}
    >
      <span className="player-card-number">{player.shirtNumber ?? '–'}</span>
      <div className="player-card-body">
        <span className="player-card-name">{player.name}</span>
        <span className="player-card-meta">
          <span className="player-card-position">{player.position}</span>
          {player.club && !compact && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="player-card-club">{player.club}</span>
            </>
          )}
        </span>
      </div>
    </Link>
  );
}

PlayerCard.propTypes = {
  player: playerShape.isRequired,
  compact: PropTypes.bool,
};

export default PlayerCard;
