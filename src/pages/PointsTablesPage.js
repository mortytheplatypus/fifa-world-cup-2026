import { useMemo, useState } from 'react';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import GroupActivityFilter from '../components/GroupActivityFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import StandingsTable from '../components/StandingsTable';
import { useSettings } from '../context/SettingsContext';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupTeamFilters } from '../hooks/useGroupTeamFilters';
import { useGroupsData } from '../hooks/useGroupsData';
import { GROUP_LETTERS } from '../utils/data';
import {
  filterGroupsByActivity,
  getActivityFilterEmptyMessage,
  getGroupActivityIndicators,
} from '../utils/fixtures';
import { computeGroupStandings } from '../utils/standings';

function PointsTablesPage() {
  const { timeZone } = useTimezone();
  const { favoriteTeamId } = useSettings();
  const { teams, groupedTeams, fixtures, loading, error } = useGroupsData();
  const [activityFilter, setActivityFilter] = useState('all');
  const {
    selectedGroup,
    teamFilter,
    favoriteTeamName,
    handleGroupChange,
    handleTeamFilterChange,
  } = useGroupTeamFilters(teams, favoriteTeamId);

  const groupActivity = useMemo(
    () => getGroupActivityIndicators(fixtures, timeZone),
    [fixtures, timeZone]
  );

  const visibleGroups = useMemo(() => {
    const groups =
      selectedGroup === 'all' ? GROUP_LETTERS : [selectedGroup];

    return filterGroupsByActivity(groups, groupActivity, activityFilter);
  }, [selectedGroup, groupActivity, activityFilter]);

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

          <GroupActivityFilter
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value)}
          />
        </div>
      </header>

      {visibleGroups.length === 0 ? (
        <p className="status-message points-tables-empty">
          {getActivityFilterEmptyMessage(activityFilter)}
        </p>
      ) : (
        <div className="points-tables-grid">
          {visibleGroups.map((letter) => (
            <StandingsTable
              key={letter}
              groupId={letter}
              standings={standingsByGroup[letter]}
              activities={groupActivity.get(letter) ?? []}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PointsTablesPage;
