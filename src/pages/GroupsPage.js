import { useMemo, useState } from 'react';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import GroupActivityFilter from '../components/GroupActivityFilter';
import GroupGridCard from '../components/GroupGridCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSettings } from '../context/SettingsContext';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { useNow } from '../hooks/useNow';
import { getTeamById, GROUP_LETTERS, getTeamDisplayName } from '../utils/data';
import {
  filterGroupsByActivity,
  getActivityFilterEmptyMessage,
  getGroupActivityIndicators,
} from '../utils/fixtures';

function GroupsPage() {
  const { timeZone } = useTimezone();
  const { favoriteTeamId } = useSettings();
  const { teams, groupedTeams, fixtures, loading, error } = useGroupsData();
  const now = useNow(30000);
  const [teamFilter, setTeamFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const groupActivity = useMemo(
    () => getGroupActivityIndicators(fixtures, timeZone, now),
    [fixtures, timeZone, now]
  );

  const favoriteTeamName = favoriteTeamId
    ? getTeamDisplayName(getTeamById(teams, favoriteTeamId)?.name)
    : null;

  const visibleGroups = useMemo(() => {
    let groups = GROUP_LETTERS;

    if (teamFilter === 'favorite' && favoriteTeamId) {
      const favoriteTeam = getTeamById(teams, favoriteTeamId);
      groups = favoriteTeam ? [favoriteTeam.group] : GROUP_LETTERS;
    }

    return filterGroupsByActivity(groups, groupActivity, activityFilter);
  }, [teamFilter, favoriteTeamId, teams, groupActivity, activityFilter]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page groups-page">
      <header className="groups-page-header">
        <h1>Groups</h1>

        <div className="fixtures-controls">
          <GroupActivityFilter
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value)}
          />

          <FavoriteTeamFilter
            teamName={favoriteTeamName}
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          />
        </div>
      </header>

      {visibleGroups.length === 0 ? (
        <p className="status-message groups-empty">
          {getActivityFilterEmptyMessage(activityFilter)}
        </p>
      ) : (
        <div className="group-grid">
          {visibleGroups.map((letter) => (
            <GroupGridCard
              key={letter}
              groupId={letter}
              teams={groupedTeams[letter]}
              activities={groupActivity.get(letter) ?? []}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default GroupsPage;
