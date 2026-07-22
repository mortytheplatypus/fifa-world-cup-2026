import { Link, Navigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PlayerAvatar from '../components/PlayerAvatar';
import PlayerStats from '../components/PlayerStats';
import { usePlayerPageData } from '../hooks/useTeamPageData';
import { getTeamDisplayName, getTeamPath } from '../utils/data';

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
    </section>
  );
}

export default PlayerPage;
