import PropTypes from 'prop-types';
import { GroupActivityBadges } from './GroupActivityBadge';
import { groupIdType } from '../propTypes';
import { getTeamDisplayName } from '../utils/data';

const activityShape = PropTypes.shape({
  variant: PropTypes.oneOf(['upcoming', 'results', 'live']).isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

function StandingsTable({
  groupId,
  standings,
  title,
  embedded,
  activities = [],
}) {
  const heading = title ?? `Group ${groupId}`;

  return (
    <section className={embedded ? 'standings-embedded' : 'standings-card'}>
      {!embedded && (
        <h2 className="standings-group-title">
          <span>{heading}</span>
          <GroupActivityBadges activities={activities} />
        </h2>
      )}
      <div className="standings-table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th scope="col" className="standings-col-pos">#</th>
              <th scope="col" className="standings-col-team">Team</th>
              <th scope="col">P</th>
              <th scope="col">W</th>
              <th scope="col">D</th>
              <th scope="col">L</th>
              <th scope="col">GF</th>
              <th scope="col">GA</th>
              <th scope="col">GD</th>
              <th scope="col" className="standings-col-pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.team.id}>
                <td className="standings-col-pos">{index + 1}</td>
                <td className="standings-col-team">
                  <div className="standings-team">
                    <img
                      className="standings-team-flag"
                      src={`https://flagcdn.com/w40/${row.team.flagCode}.png`}
                      alt=""
                      width={24}
                      height={18}
                    />
                    <span className="standings-team-name">{getTeamDisplayName(row.team.name)}</span>
                  </div>
                </td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td className={row.goalDifference > 0 ? 'standings-positive' : row.goalDifference < 0 ? 'standings-negative' : ''}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="standings-col-pts">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

StandingsTable.propTypes = {
  groupId: groupIdType,
  title: PropTypes.string,
  embedded: PropTypes.bool,
  activities: PropTypes.arrayOf(activityShape),
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      team: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        flagCode: PropTypes.string.isRequired,
      }).isRequired,
      played: PropTypes.number.isRequired,
      won: PropTypes.number.isRequired,
      drawn: PropTypes.number.isRequired,
      lost: PropTypes.number.isRequired,
      goalsFor: PropTypes.number.isRequired,
      goalsAgainst: PropTypes.number.isRequired,
      goalDifference: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default StandingsTable;
