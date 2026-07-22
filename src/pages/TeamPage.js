import { Link, Navigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SquadGrid from '../components/SquadGrid';
import { useTeamPageData } from '../hooks/useTeamPageData';
import { getTeamDisplayName } from '../utils/data';

function TeamPage() {
  const { flagCode } = useParams();
  const { team, squad, squadPlayers, loading, error } = useTeamPageData(flagCode);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  if (!team) {
    return <Navigate to="/groups" replace />;
  }

  const captain = squadPlayers.find((player) => player.id === squad?.captain);
  const accent = team.colors?.[0] ?? 'var(--highlight)';

  return (
    <section className="page team-page" style={{ '--team-accent': accent }}>
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/groups/${team.group}`}>Group {team.group}</Link>
        <span aria-hidden="true">/</span>
        <span>{getTeamDisplayName(team.name)}</span>
      </nav>

      <header className="team-page-header">
        <div className="team-page-flag-wrap">
          <img
            className="team-page-flag"
            src={`https://flagcdn.com/w160/${team.flagCode}.png`}
            alt=""
            width={96}
            height={72}
          />
        </div>
        <div className="team-page-header-body">
          <p className="team-page-eyebrow">Group {team.group}</p>
          <h1>{team.name}</h1>
          {squad && (
            <p className="team-page-meta">
              {squadPlayers.length} players
              {squad.coach?.name ? ` · Coach ${squad.coach.name}` : ''}
            </p>
          )}
        </div>
      </header>

      {squad && (
        <div className="team-page-staff">
          <div className="team-page-staff-card">
            <span className="team-page-staff-label">Coach</span>
            <span className="team-page-staff-name">{squad.coach.name}</span>
            {squad.coach.nationality && (
              <span className="team-page-staff-meta">{squad.coach.nationality}</span>
            )}
          </div>
          {captain && (
            <div className="team-page-staff-card">
              <span className="team-page-staff-label">Captain</span>
              <span className="team-page-staff-name">{captain.name}</span>
              {captain.shirtNumber != null && (
                <span className="team-page-staff-meta">#{captain.shirtNumber}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="team-page-panel">
        <SquadGrid players={squadPlayers} team={team} />
      </div>
    </section>
  );
}

export default TeamPage;
