import PropTypes from 'prop-types';
import { teamShape } from '../propTypes';
import { getTeamDisplayName } from '../utils/data';

function GroupTeamGrid({ teams }) {
  return (
    <div className="group-team-grid">
      {teams.map((team) => (
        <div key={team.id} className="group-team-grid-cell">
          <img
            className="group-team-grid-flag"
            src={`https://flagcdn.com/w160/${team.flagCode}.png`}
            alt=""
            width={56}
            height={42}
          />
          <span className="group-team-grid-name">{getTeamDisplayName(team.name)}</span>
        </div>
      ))}
    </div>
  );
}

GroupTeamGrid.propTypes = {
  teams: PropTypes.arrayOf(teamShape).isRequired,
};

export default GroupTeamGrid;
