import { useMemo } from 'react';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import StandingsTable from '../components/StandingsTable';
import { useSettings } from '../context/SettingsContext';
import { useGroupTeamFilters } from '../hooks/useGroupTeamFilters';
import { useGroupsData } from '../hooks/useGroupsData';
import { GROUP_LETTERS } from '../utils/data';
import { computeGroupStandings } from '../utils/standings';

function PointsTablesPage() {
  const { favoriteTeamId } = useSettings();
  const { teams, groupedTeams, fixtures, loading, error } = useGroupsData();
  const {
    selectedGroup,
    teamFilter,
    favoriteTeamName,
    handleGroupChange,
    handleTeamFilterChange,
  } = useGroupTeamFilters(teams, favoriteTeamId);

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

        <div className="fixtures-controls">
          <label className="fixtures-group-filter">
            <span className="fixtures-group-filter-label">Group</span>
            <select
              className="fixtures-group-select"
              value={selectedGroup}
              onChange={handleGroupChange}
            >
              <option value="all">All groups</option>
              {GROUP_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  Group {letter}
                </option>
              ))}
            </select>
          </label>

          <FavoriteTeamFilter
            teamName={favoriteTeamName}
            value={teamFilter}
            onChange={handleTeamFilterChange}
          />
        </div>
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
