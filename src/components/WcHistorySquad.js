import PropTypes from 'prop-types';
import { playerShape } from '../propTypes';
import PlayerCard from './PlayerCard';

function WcHistorySquad({ year, players, loading }) {
  if (loading) {
    return <p className="status-message wc-history-squad-loading">Loading squad…</p>;
  }

  if (!players.length) {
    return (
      <p className="status-message wc-history-squad-empty">
        No squad data for {year}.
      </p>
    );
  }

  return (
    <div className="wc-history-squad">
      <h3 className="wc-history-squad-title">{year} squad</h3>
      <div className="squad-grid squad-grid--compact">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} compact />
        ))}
      </div>
    </div>
  );
}

WcHistorySquad.propTypes = {
  year: PropTypes.number.isRequired,
  players: PropTypes.arrayOf(playerShape).isRequired,
  loading: PropTypes.bool,
};

export default WcHistorySquad;
