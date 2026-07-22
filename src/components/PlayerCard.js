import PropTypes from 'prop-types';
import { playerShape, teamShape } from '../propTypes';
import PlayerAvatar from './PlayerAvatar';

function PlayerCard({ player, team, compact = false }) {
  return (
    <article className={`player-card${compact ? ' player-card--compact' : ''}`}>
      <PlayerAvatar player={player} team={team} size={compact ? 'small' : 'card'} />
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
    </article>
  );
}

PlayerCard.propTypes = {
  player: playerShape.isRequired,
  team: teamShape,
  compact: PropTypes.bool,
};

export default PlayerCard;
