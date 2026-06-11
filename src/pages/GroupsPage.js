import { GROUP_LETTERS } from '../utils/data';
import { useGroupsData } from '../hooks/useGroupsData';
import GroupGridCard from '../components/GroupGridCard';
import LoadingSpinner from '../components/LoadingSpinner';

function GroupsPage() {
  const { groupedTeams, loading, error } = useGroupsData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page groups-page">
      <h1>Groups</h1>

      <div className="group-grid">
        {GROUP_LETTERS.map((letter) => (
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
