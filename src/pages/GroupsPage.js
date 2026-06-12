import { useMemo, useState } from 'react';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import GroupGridCard from '../components/GroupGridCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSettings } from '../context/SettingsContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS } from '../utils/data';

function GroupsPage() {
  const { favoriteTeamId } = useSettings();
  const { teams, groupedTeams, loading, error } = useGroupsData();
  const [teamFilter, setTeamFilter] = useState('all');

  const favoriteTeamName = favoriteTeamId
    ? getTeamById(teams, favoriteTeamId)?.name
    : null;

  const visibleGroups = useMemo(() => {
    if (teamFilter !== 'favorite' || !favoriteTeamId) {
      return GROUP_LETTERS;
    }

    const favoriteTeam = getTeamById(teams, favoriteTeamId);
    return favoriteTeam ? [favoriteTeam.group] : GROUP_LETTERS;
  }, [teamFilter, favoriteTeamId, teams]);

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
          <FavoriteTeamFilter
            teamName={favoriteTeamName}
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          />
        </div>
      </header>

      <div className="group-grid">
        {visibleGroups.map((letter) => (
          <GroupGridCard
            key={letter}
            groupId={letter}
            teams={groupedTeams[letter]}
          />
        ))}
      </div>
    </section>
  );
}

export default GroupsPage;
