import PropTypes from 'prop-types';

function FavoriteTeamFilter({ teamName, value, onChange }) {
  if (!teamName) {
    return null;
  }

  return (
    <label className="fixtures-group-filter">
      <span className="fixtures-group-filter-label">Team</span>
      <select
        className="fixtures-group-select"
        value={value}
        onChange={onChange}
      >
        <option value="all">All teams</option>
        <option value="favorite">{teamName}</option>
      </select>
    </label>
  );
}

FavoriteTeamFilter.propTypes = {
  teamName: PropTypes.string,
  value: PropTypes.oneOf(['all', 'favorite']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FavoriteTeamFilter;
