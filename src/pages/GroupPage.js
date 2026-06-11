import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import FixtureCard from '../components/FixtureCard';
import GroupTeamGrid from '../components/GroupTeamGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import StandingsTable from '../components/StandingsTable';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS, isValidGroup } from '../utils/data';
import { splitFixturesByDate } from '../utils/fixtures';
import { computeGroupStandings } from '../utils/standings';

function GroupPage() {
  const navigate = useNavigate();
  const { groupId: rawGroupId } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const { groupedTeams, teams, fixtures, loading, error } = useGroupsData();

  const standings = useMemo(
    () =>
      computeGroupStandings(
        groupedTeams[groupId] ?? [],
        fixtures[groupId] ?? []
      ),
    [groupedTeams, fixtures, groupId]
  );

  const recentResults = useMemo(() => {
    const { past } = splitFixturesByDate(fixtures[groupId] ?? []);
    return past;
  }, [fixtures, groupId]);

  if (!isValidGroup(groupId)) {
    return <Navigate to="/groups" replace />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const groupTeams = groupedTeams[groupId];

  function handleGroupChange(event) {
    navigate(`/groups/${event.target.value}`);
  }

  return (
    <section className="page group-page">
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <span>Group {groupId}</span>
      </nav>

      <header className="group-page-header">
        <h1>Group {groupId}</h1>

        <label className="fixtures-group-filter group-page-select">
          <select
            className="fixtures-group-select"
            value={groupId}
            onChange={handleGroupChange}
            aria-label="Select group"
          >
            {GROUP_LETTERS.map((letter) => (
              <option key={letter} value={letter}>
                Group {letter}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="group-overview-card">
        <div className="group-overview-teams">
          <GroupTeamGrid teams={groupTeams} />
        </div>
        <div className="group-overview-standings">
          <StandingsTable
            groupId={groupId}
            standings={standings}
            embedded
          />
        </div>
      </div>

      <div className="group-page-actions">
        <Link
          to={`/groups/${groupId}/fixtures/upcoming`}
          className="link-button"
        >
          Upcoming matches
        </Link>
        <Link
          to={`/groups/${groupId}/fixtures/all`}
          className="link-button secondary"
        >
          All matches
        </Link>
      </div>

      <section className="group-recent-results">
        <h2 className="group-section-title">Recent results</h2>
        {recentResults.length === 0 ? (
          <p className="status-message group-recent-results-empty">
            No recent results yet.
          </p>
        ) : (
          <div className="fixture-list group-recent-results-list">
            {recentResults.map((fixture) => (
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
    </section>
  );
}

export default GroupPage;
