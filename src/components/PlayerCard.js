import PropTypes from 'prop-types';
import { playerShape, teamShape } from '../propTypes';
import PlayerAvatar from './PlayerAvatar';

function PlayerCard({ player, team, compact = false, onSelect }) {
  const className = `player-card${compact ? ' player-card--compact' : ''}${
    onSelect ? ' player-card--interactive' : ''
  }`;

  const content = (
    <>
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
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onSelect(player)}
        aria-haspopup="dialog"
      >
        {content}
      </button>
    );
  }

  return <article className={className}>{content}</article>;
}

PlayerCard.propTypes = {
  player: playerShape.isRequired,
  team: teamShape,
  compact: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default PlayerCard;
