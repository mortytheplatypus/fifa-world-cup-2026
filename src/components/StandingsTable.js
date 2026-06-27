import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { fixtureShape, groupIdType } from '../propTypes';
import { getTeamDisplayName, getTeamPath } from '../utils/data';
import { getThirdPlaceQualificationHint } from '../utils/qualification';
import { computeConductScore } from '../utils/standings';

const thirdPlaceQualificationShape = PropTypes.shape({
  rank: PropTypes.number.isRequired,
  qualifies: PropTypes.bool.isRequired,
});

function getQualificationRowClass(index, showQualification, thirdPlaceQualification) {
  if (!showQualification) {
    return undefined;
  }

  if (index === 0 || index === 1) {
    return 'standings-row--qualified';
  }

  if (index === 2 && thirdPlaceQualification?.qualifies) {
    return 'standings-row--qualified';
  }

  return undefined;
}

function getThirdPlaceRowHint(thirdPlaceQualification) {
  if (!thirdPlaceQualification) {
    return undefined;
  }

  return getThirdPlaceQualificationHint(thirdPlaceQualification);
}

function StandingsTable({
  groupId,
  standings,
  title,
  embedded,
  showQualification = false,
  showConduct = false,
  fixtures = [],
  thirdPlaceQualification = null,
}) {
  const heading = title ?? `Group ${groupId}`;

  return (
    <section className={embedded ? 'standings-embedded' : 'standings-card'}>
      {!embedded && (
        groupId ? (
          <Link
            to={`/groups/${groupId}`}
            className="standings-group-title standings-group-title--link"
          >
            {heading}
          </Link>
        ) : (
          <h2 className="standings-group-title">{heading}</h2>
        )
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
              {showConduct && (
                <th
                  scope="col"
                  className="standings-col-conduct"
                  title="Fair play conduct score (tie-breaker)"
                >
                  Conduct
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const conductScore = showConduct
                ? computeConductScore(row.team.id, fixtures)
                : null;
              const thirdPlaceHint =
                showQualification && index === 2
                  ? getThirdPlaceRowHint(thirdPlaceQualification)
                  : undefined;

              return (
              <tr
                key={row.team.id}
                className={getQualificationRowClass(
                  index,
                  showQualification,
                  thirdPlaceQualification
                )}
                title={thirdPlaceHint}
                aria-label={thirdPlaceHint}
              >
                <td className="standings-col-pos">{index + 1}</td>
                <td className="standings-col-team">
                  <Link to={getTeamPath(row.team)} className="standings-team standings-team--link">
                    <img
                      className="standings-team-flag"
                      src={`https://flagcdn.com/w40/${row.team.flagCode}.png`}
                      alt=""
                      width={24}
                      height={18}
                    />
                    <span className="standings-team-name">{getTeamDisplayName(row.team.name)}</span>
                  </Link>
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
                {showConduct && (
                  <td
                    className={
                      conductScore < 0
                        ? 'standings-col-conduct standings-negative'
                        : 'standings-col-conduct'
                    }
                  >
                    {conductScore}
                  </td>
                )}
              </tr>
              );
            })}
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
  showQualification: PropTypes.bool,
  showConduct: PropTypes.bool,
  fixtures: PropTypes.arrayOf(fixtureShape),
  thirdPlaceQualification: thirdPlaceQualificationShape,
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
