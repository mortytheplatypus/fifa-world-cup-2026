import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { teamShape } from '../propTypes';
import { getTeamDisplayName, getTeamPath } from '../utils/data';

function GroupTeamGrid({ teams }) {
  return (
    <div className="group-team-grid">
      {teams.map((team) => (
        <Link
          key={team.id}
          to={getTeamPath(team)}
          className="group-team-grid-cell group-team-grid-cell--link"
        >
          <img
            className="group-team-grid-flag"
            src={`https://flagcdn.com/w160/${team.flagCode}.png`}
            alt=""
            width={56}
            height={42}
          />
          <span className="group-team-grid-name">{getTeamDisplayName(team.name)}</span>
        </Link>
      ))}
    </div>
  );
}

GroupTeamGrid.propTypes = {
  teams: PropTypes.arrayOf(teamShape).isRequired,
};

export default GroupTeamGrid;
