import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import KnockoutBracket from '../components/KnockoutBracket';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGroupsData } from '../hooks/useGroupsData';
import { useKnockoutResults } from '../hooks/useKnockoutResults';
import { GROUP_LETTERS } from '../utils/data';
import { computeGroupStandings } from '../utils/standings';

function KnockoutPage() {
  const [viewRound, setViewRound] = useState('r32');
  const { groupedTeams, fixtures, loading, error } = useGroupsData();
  const { knockoutResults } = useKnockoutResults();

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
        </div>
        {viewRound === 'r32' && (
          <Link to="/knockout/third-place-rules" className="knockout-rules-link">
            Third-place Standings
          </Link>
        )}
      </header>

      <KnockoutBracket
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        viewRound={viewRound}
        onViewRoundChange={setViewRound}
      />

    </section>
  );
}

export default KnockoutPage;
