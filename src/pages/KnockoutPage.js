import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import KnockoutBracket from '../components/KnockoutBracket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGroupsData } from '../hooks/useGroupsData';
import { GROUP_LETTERS, getTeamDisplayName } from '../utils/data';
import { isKnockoutTeamsRevealed } from '../utils/knockoutConfig';
import { computeGroupStandings } from '../utils/standings';
import { rankThirdPlaceTeams } from '../utils/thirdPlaceRanking';

const revealTeams = isKnockoutTeamsRevealed();

function KnockoutPage() {
  const { groupedTeams, fixtures, loading, error } = useGroupsData();

  const standingsByGroup = useMemo(
    () =>
      GROUP_LETTERS.reduce((acc, letter) => {
        acc[letter] = computeGroupStandings(
          groupedTeams[letter] ?? [],
          fixtures[letter] ?? []
        );
        return acc;
      }, {}),
    [groupedTeams, fixtures]
  );

  const qualifyingThirds = useMemo(() => {
    if (!revealTeams) return [];
    return rankThirdPlaceTeams(standingsByGroup).filter((entry) => entry.qualifies);
  }, [standingsByGroup]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page knockout-page">
      <header className="knockout-header">
        <div>
          <h1>Knockout</h1>
          <p className="page-subtitle">
            {revealTeams
              ? 'Round of 32 through to the final - group winners and runners-up are filled from current standings'
              : 'Round of 32 through to the final - slots shown as group-stage placeholders until teams are revealed'}
          </p>
        </div>
        <Link to="/knockout/third-place-rules" className="knockout-rules-link">
          Third-place rules
        </Link>
      </header>

      <KnockoutBracket standingsByGroup={standingsByGroup} />

      {revealTeams && (
        <section className="knockout-third-summary" aria-labelledby="knockout-third-summary-heading">
          <div className="knockout-third-summary-header">
            <h2 id="knockout-third-summary-heading">Best third-placed teams</h2>
            <Link to="/knockout/third-place-rules" className="knockout-third-summary-link">
              View full rules
            </Link>
          </div>
          <p className="knockout-third-summary-note">
            Top 8 of 12 third-placed teams by points, goal difference, and goals
            scored. Slot assignment to specific Round of 32 matches is shown as
            labels on the bracket.
          </p>
          <ol className="knockout-third-summary-list">
            {qualifyingThirds.map((entry) => (
              <li key={entry.team.id} className="knockout-third-summary-item">
                <span className="knockout-third-summary-rank">{entry.rank}</span>
                <img
                  className="knockout-third-summary-flag"
                  src={`https://flagcdn.com/w40/${entry.team.flagCode}.png`}
                  alt=""
                  width={24}
                  height={18}
                />
                <span className="knockout-third-summary-name">
                  {getTeamDisplayName(entry.team.name)}
                </span>
                <span className="knockout-third-summary-group">Group {entry.group}</span>
                <span className="knockout-third-summary-stats">
                  {entry.points} pts · {entry.goalDifference > 0 ? '+' : ''}
                  {entry.goalDifference} GD · {entry.goalsFor} GF
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}

export default KnockoutPage;
