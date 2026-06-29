import { Link, Navigate, useParams } from 'react-router-dom';
// import { useState } from 'react';
// import ChampionshipStars from '../components/ChampionshipStars';
import LoadingSpinner from '../components/LoadingSpinner';
import SquadGrid from '../components/SquadGrid';
// import WcHistoryList from '../components/WcHistoryList';
import { useTeamPageData } from '../hooks/useTeamPageData';
import { getTeamDisplayName } from '../utils/data';
// import { getBestFinishLabel } from '../utils/data';

// const TABS = [
//   { id: 'squad', label: 'Current squad' },
//   { id: 'history', label: 'World Cup history' },
// ];

function TeamPage() {
  const { flagCode } = useParams();
  // const [activeTab, setActiveTab] = useState('squad');
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

  return (
    <section className="page team-page">
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/groups/${team.group}`}>Group {team.group}</Link>
        <span aria-hidden="true">/</span>
        <span>{getTeamDisplayName(team.name)}</span>
      </nav>

      <header className="team-page-header">
        <img
          className="team-page-flag"
          src={`https://flagcdn.com/w160/${team.flagCode}.png`}
          alt=""
          width={80}
          height={60}
        />
        <div className="team-page-header-body">
          <h1>{team.name}</h1>
          <div className="team-page-meta">
            <span>Group {team.group}</span>
            {team.fifaRankingPreWc != null && (
              <>
                <span aria-hidden="true"> · </span>
                <span>FIFA rank #{team.fifaRankingPreWc}</span>
              </>
            )}
            {/* wcHistory — hidden for now
            {wcHistory && (
              <>
                <span aria-hidden="true"> · </span>
                <span>{wcHistory.appearances} WC appearance{wcHistory.appearances === 1 ? '' : 's'}</span>
              </>
            )}
            */}
          </div>
          {/* wcHistory — hidden for now
          {wcHistory && (
            <div className="team-page-titles">
              <ChampionshipStars count={wcHistory.championships} />
              <span className="team-page-best-finish">
                Best finish: {getBestFinishLabel(wcHistory.bestFinish)}
              </span>
            </div>
          )}
          */}
        </div>
      </header>

      {squad && (
        <div className="team-page-staff">
          <div className="team-page-staff-card">
            <span className="team-page-staff-label">Coach</span>
            <span className="team-page-staff-name">{squad.coach.name}</span>
            {squad.coach.nationality && (
              <span className="team-page-staff-meta">({squad.coach.nationality})</span>
            )}
          </div>
          {captain && (
            <div className="team-page-staff-card">
              <span className="team-page-staff-label">Captain</span>
              <span className="team-page-staff-name">{captain.name}</span>
            </div>
          )}
        </div>
      )}

      {/* wcHistory tab — hidden for now
      <div className="team-page-tabs" role="tablist" aria-label="Team sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`team-page-tab${activeTab === tab.id ? ' team-page-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="team-page-panel" role="tabpanel">
        {activeTab === 'squad' && <SquadGrid players={squadPlayers} />}
        {activeTab === 'history' && (
          <WcHistoryList tournaments={wcHistory?.tournaments ?? []} />
        )}
      </div>
      */}
      <div className="team-page-panel">
        <SquadGrid players={squadPlayers} />
      </div>
    </section>
  );
}

export default TeamPage;
