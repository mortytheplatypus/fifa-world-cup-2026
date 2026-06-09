import { Link, Navigate, useParams } from 'react-router-dom';
import FixtureCard from '../components/FixtureCard';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, isValidGroup } from '../utils/data';

function GroupFixturesPage() {
  const { groupId: rawGroupId } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const { teams, fixtures, loading, error } = useGroupsData();

  if (!isValidGroup(groupId)) {
    return <Navigate to="/groups" replace />;
  }

  if (loading) {
    return <p className="status-message">Loading fixtures…</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const groupFixtures = fixtures[groupId] || [];

  return (
    <section className="page fixtures-page">
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/groups/${groupId}`}>Group {groupId}</Link>
        <span aria-hidden="true">/</span>
        <span>Fixtures</span>
      </nav>

      <h1>Group {groupId} Fixtures</h1>

      {groupFixtures.length === 0 ? (
        <p className="status-message">No fixtures available yet.</p>
      ) : (
        <div className="fixture-list">
          {groupFixtures.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              homeTeam={getTeamById(teams, fixture.homeTeam)}
              awayTeam={getTeamById(teams, fixture.awayTeam)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default GroupFixturesPage;
