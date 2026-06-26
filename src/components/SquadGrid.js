import PropTypes from 'prop-types';
import { playerShape } from '../propTypes';
import PlayerCard from './PlayerCard';

function SquadGrid({ players }) {
  if (!players?.length) {
    return <p className="status-message">No squad data available.</p>;
  }

  return (
    <div className="squad-grid">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}

SquadGrid.propTypes = {
  players: PropTypes.arrayOf(playerShape).isRequired,
};

export default SquadGrid;
