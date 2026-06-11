import { useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import StandingsTable from '../components/StandingsTable';
import { useGroupsData } from '../hooks/useGroupsData';
import { GROUP_LETTERS } from '../utils/data';
import { computeGroupStandings } from '../utils/standings';

function PointsTablesPage() {
  const { groupedTeams, fixtures, loading, error } = useGroupsData();
  const [selectedGroup, setSelectedGroup] = useState('all');

  const visibleGroups = useMemo(
    () => (selectedGroup === 'all' ? GROUP_LETTERS : [selectedGroup]),
    [selectedGroup]
  );

  const standingsByGroup = useMemo(
    () =>
      visibleGroups.reduce((acc, letter) => {
        acc[letter] = computeGroupStandings(
          groupedTeams[letter] ?? [],
          fixtures[letter] ?? []
        );
        return acc;
      }, {}),
    [visibleGroups, groupedTeams, fixtures]
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page points-tables-page">
      <header className="points-tables-header">
        <div>
          <h1>Points Tables</h1>
          <p className="page-subtitle">Group stage standings</p>
        </div>

        <label className="fixtures-group-filter">
          <span className="fixtures-group-filter-label">Group</span>
          <select
            className="fixtures-group-select"
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
          >
            <option value="all">All groups</option>
            {GROUP_LETTERS.map((letter) => (
              <option key={letter} value={letter}>
                Group {letter}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="points-tables-grid">
        {visibleGroups.map((letter) => (
          <StandingsTable
            key={letter}
            groupId={letter}
            standings={standingsByGroup[letter]}
          />
        ))}
      </div>
    </section>
  );
}

export default PointsTablesPage;
