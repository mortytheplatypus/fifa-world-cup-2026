import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { groupIdType, teamShape } from '../propTypes';
import { getTeamDisplayName } from '../utils/data';

const activityShape = PropTypes.shape({
  variant: PropTypes.oneOf(['upcoming', 'results', 'live']).isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

function getActivityClasses(activities) {
  return [...new Set(activities.map((activity) => activity.variant))]
    .map((variant) => `group-grid-card--${variant}`)
    .join(' ');
}

function GroupGridCard({ groupId, teams, activities = [] }) {
  const activityTitle = activities.map((activity) => activity.label).join(' · ');

  return (
    <Link
      to={`/groups/${groupId}`}
      className={`group-grid-card ${getActivityClasses(activities)}`.trim()}
      title={activityTitle || undefined}
    >
      <div className="group-flags-block">
        <div className="group-flags-grid">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group-team-cell"
              data-name={getTeamDisplayName(team.name)}
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
  activities: PropTypes.arrayOf(activityShape),
};

export default GroupGridCard;
