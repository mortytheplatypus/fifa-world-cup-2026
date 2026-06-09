import { Link, Navigate, useParams } from 'react-router-dom';
import TeamRow from '../components/TeamRow';
import { useGroupsData } from '../hooks/useGroupsData';
import { isValidGroup } from '../utils/data';

function GroupPage() {
  const { groupId: rawGroupId } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const { groupedTeams, loading, error } = useGroupsData();

  if (!isValidGroup(groupId)) {
    return <Navigate to="/groups" replace />;
  }

  if (loading) {
    return <p className="status-message">Loading group…</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const teams = groupedTeams[groupId];

  return (
    <section className="page group-page">
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <span>Group {groupId}</span>
      </nav>

      <h1>Group {groupId}</h1>

      <div className="team-list card">
        {teams.map((team) => (
          <TeamRow key={team.id} team={team} />
        ))}
      </div>

      <Link to={`/groups/${groupId}/fixtures`} className="link-button">
        View fixtures
      </Link>
    </section>
  );
}

export default GroupPage;
