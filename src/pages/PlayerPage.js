import { Link, Navigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerAvatar from '../components/PlayerAvatar';
import PlayerStats from '../components/PlayerStats';
import { usePlayerPageData } from '../hooks/useTeamPageData';
import { getTeamDisplayName, getTeamPath, getWcRoleLabel } from '../utils/data';

function PlayerPage() {
  const { playerId } = useParams();
  const { player, team, loading, error } = usePlayerPageData(playerId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  if (!player) {
    return <Navigate to="/groups" replace />;
  }

  return (
    <section className="page player-page">
      <nav className="breadcrumb">
        {team ? (
          <>
            <Link to={getTeamPath(team)}>{getTeamDisplayName(team.name)}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : (
          <>
            <Link to="/groups">Groups</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span>{player.name}</span>
      </nav>

      <div className="player-page-hero">
        <PlayerAvatar player={player} team={team} />

        <div className="player-page-hero-body">
          <header className="player-page-header">
            {team && (
              <Link to={getTeamPath(team)} className="player-page-team-link">
                <img
                  className="player-page-flag"
                  src={`https://flagcdn.com/w80/${team.flagCode}.png`}
                  alt=""
                  width={48}
                  height={36}
                />
                <span>{getTeamDisplayName(team.name)}</span>
              </Link>
            )}
            <h1>{player.name}</h1>
            <p className="player-page-subtitle">
              {player.position}
              {player.shirtNumber != null && ` · #${player.shirtNumber}`}
              {player.club && ` · ${player.club}`}
            </p>
          </header>

          <PlayerStats player={player} />
        </div>
      </div>

      {player.worldCups?.length > 0 && (
        <section className="player-wc-history">
          <h2 className="player-section-title">World Cup record</h2>
          <div className="player-wc-table-wrap">
            <table className="player-wc-table">
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Role</th>
                  <th scope="col">Goals</th>
                  <th scope="col">Assists</th>
                </tr>
              </thead>
              <tbody>
                {[...player.worldCups]
                  .sort((a, b) => b.year - a.year)
                  .map((entry) => (
                    <tr key={entry.year}>
                      <td>{entry.year}</td>
                      <td>{getWcRoleLabel(entry.role)}</td>
                      <td>{entry.goals ?? 0}</td>
                      <td>{entry.assists ?? 0}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}

export default PlayerPage;
