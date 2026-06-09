import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { groupIdType, teamShape } from '../propTypes';

function GroupGridCard({ groupId, teams }) {
  return (
    <Link to={`/groups/${groupId}`} className="group-grid-card">
      <div className="group-flags-block">
        <div className="group-flags-grid">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group-team-cell"
              data-name={team.name}
            >
              <img
                className="group-flag"
                src={`https://flagcdn.com/w160/${team.flagCode}.png`}
                alt={team.name}
                width={48}
                height={36}
              />
              <span className="group-team-id">{team.id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="group-name-block">
        <span className="group-grid-letter">{groupId}</span>
      </div>
    </Link>
  );
}

GroupGridCard.propTypes = {
  groupId: groupIdType,
  teams: PropTypes.arrayOf(teamShape).isRequired,
};

export default GroupGridCard;
