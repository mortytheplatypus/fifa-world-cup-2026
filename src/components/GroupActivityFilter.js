import PropTypes from 'prop-types';

function GroupActivityFilter({ value, onChange }) {
  return (
    <label className="fixtures-group-filter">
      <span className="fixtures-group-filter-label">Show</span>
      <select
        className="fixtures-group-select"
        value={value}
        onChange={onChange}
        aria-label="Filter groups by match activity"
      >
        <option value="all">All groups</option>
        <option value="active">Results & upcoming</option>
        <option value="results">Latest results</option>
        <option value="upcoming">Upcoming matches</option>
      </select>
    </label>
  );
}

GroupActivityFilter.propTypes = {
  value: PropTypes.oneOf(['all', 'active', 'results', 'upcoming']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default GroupActivityFilter;
