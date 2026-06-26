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
      <StatItem label="Age" value={player.age} />
      <StatItem label="Club" value={player.club} />
      <StatItem label="Position" value={player.position} />
      <StatItem label="Shirt" value={player.shirtNumber} />
      <StatItem label="Height" value={player.heightCm ? `${player.heightCm} cm` : null} />
      <StatItem label="Preferred foot" value={player.foot} />
      <StatItem label="Caps" value={player.caps} />
      <StatItem label="International goals" value={player.internationalGoals} />
      <StatItem label="WC appearances" value={player.wcAppearances} />
      <StatItem label="WC goals" value={player.wcGoals} />
    </dl>
  );
}

PlayerStats.propTypes = {
  player: playerShape.isRequired,
};

export default PlayerStats;
