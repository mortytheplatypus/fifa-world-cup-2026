import PropTypes from 'prop-types';
import { playerShape } from '../propTypes';

function StatItem({ label, value }) {
  return (
    <div className="player-stat-item">
      <dt className="player-stat-label">{label}</dt>
      <dd className="player-stat-value">{value ?? '–'}</dd>
    </div>
  );
}

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function PlayerStats({ player }) {
  return (
    <dl className="player-stats-grid">
      <StatItem label="Club" value={player.club} />
      <StatItem label="Position" value={player.position} />
    </dl>
  );
}

PlayerStats.propTypes = {
  player: playerShape.isRequired,
};

export default PlayerStats;
