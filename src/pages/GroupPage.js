import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import FixtureCard from '../components/FixtureCard';
import GroupTeamGrid from '../components/GroupTeamGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import StandingsTable from '../components/StandingsTable';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, getTeamDisplayName, GROUP_LETTERS, isValidGroup } from '../utils/data';
import {
  formatDateHeading,
  getDateKeys,
  groupFixturesByDate,
  sortFixtures,
} from '../utils/fixtures';
import { computeGroupStandings } from '../utils/standings';

function GroupPage() {
  const navigate = useNavigate();
  const { timeZone } = useTimezone();
  const { groupId: rawGroupId } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const { groupedTeams, teams, fixtures, loading, error } = useGroupsData();
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    setTeamFilter('all');
  }, [groupId]);

  const standings = useMemo(
    () =>
      computeGroupStandings(
        groupedTeams[groupId] ?? [],
        fixtures[groupId] ?? []
      ),
    [groupedTeams, fixtures, groupId]
  );

  const groupFixtures = useMemo(
    () => sortFixtures(fixtures[groupId] ?? []),
    [fixtures, groupId]
  );

  const filteredFixtures = useMemo(() => {
    if (teamFilter === 'all') {
      return groupFixtures;
    }

    return groupFixtures.filter(
      (fixture) =>
        fixture.homeTeam === teamFilter || fixture.awayTeam === teamFilter
    );
  }, [groupFixtures, teamFilter]);

  const fixturesByDate = useMemo(
    () => groupFixturesByDate({ [groupId]: filteredFixtures }, timeZone),
    [filteredFixtures, groupId, timeZone]
  );

  const dates = useMemo(() => getDateKeys(fixturesByDate), [fixturesByDate]);

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
            fixtures={fixtures[groupId] ?? []}
            showConduct
            embedded
          />
        </div>
      </div>

      <section className="group-matches">
        <div className="group-matches-toolbar">
          <h2 className="group-section-title">All Results</h2>
          <label className="fixtures-group-filter group-matches-filter">
            <span className="fixtures-group-filter-label">Team</span>
            <select
              className="fixtures-group-select"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              aria-label="Filter matches by team"
            >
              <option value="all">All teams</option>
              {groupTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamDisplayName(team.name)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {dates.length === 0 ? (
          <p className="status-message group-matches-empty">
            {teamFilter === 'all'
              ? 'No matches available.'
              : 'No matches for this team.'}
          </p>
        ) : (
          <div className="fixtures-by-date">
            {dates.map((dateKey) => (
              <section key={dateKey} className="fixtures-date-section">
                <h3 className="fixtures-date-title">
                  {formatDateHeading(dateKey)}
                </h3>
                <div className="fixture-list">
                  {fixturesByDate[dateKey].map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      homeTeam={getTeamById(teams, fixture.homeTeam)}
                      awayTeam={getTeamById(teams, fixture.awayTeam)}
                      showDate={false}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default GroupPage;
