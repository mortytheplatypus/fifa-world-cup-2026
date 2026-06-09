import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import FixtureCard from '../components/FixtureCard';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS, isValidGroup } from '../utils/data';
import { sortFixtures, splitFixturesByDate } from '../utils/fixtures';

const VIEW_CONFIG = {
  upcoming: {
    title: 'Upcoming Matches',
    breadcrumb: 'Upcoming',
    emptyMessage: 'No upcoming matches.',
  },
  all: {
    title: 'All Matches',
    breadcrumb: 'All matches',
    emptyMessage: 'No matches available yet.',
  },
};

function GroupFixturesPage() {
  const navigate = useNavigate();
  const { groupId: rawGroupId, view: rawView } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const view = rawView?.toLowerCase();
  const { teams, fixtures, loading, error } = useGroupsData();

  if (!isValidGroup(groupId)) {
    return <Navigate to="/groups" replace />;
  }

  if (view === 'results') {
    return <Navigate to={`/groups/${groupId}`} replace />;
  }

  if (!VIEW_CONFIG[view]) {
    return <Navigate to={`/groups/${groupId}/fixtures/upcoming`} replace />;
  }

  if (loading) {
    return <p className="status-message">Loading fixtures…</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const groupFixturesList = fixtures[groupId] ?? [];
  const { upcoming } = splitFixturesByDate(groupFixturesList);
  const groupFixtures =
    view === 'upcoming' ? upcoming : sortFixtures(groupFixturesList);
  const { title, breadcrumb, emptyMessage } = VIEW_CONFIG[view];

  function handleGroupChange(event) {
    navigate(`/groups/${event.target.value}/fixtures/${view}`);
  }

  return (
    <section className="page fixtures-page">
      <nav className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/groups/${groupId}`}>Group {groupId}</Link>
        <span aria-hidden="true">/</span>
        <span>{breadcrumb}</span>
      </nav>

      <header className="group-page-header">
        <h1>Group {groupId} : <i>{title}</i></h1>

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

      <div className="group-fixtures-tabs">
        <Link
          to={`/groups/${groupId}/fixtures/upcoming`}
          className={`group-fixtures-tab${view === 'upcoming' ? ' active' : ''}`}
          aria-current={view === 'upcoming' ? 'page' : undefined}
        >
          Upcoming matches
        </Link>
        <Link
          to={`/groups/${groupId}/fixtures/all`}
          className={`group-fixtures-tab${view === 'all' ? ' active' : ''}`}
          aria-current={view === 'all' ? 'page' : undefined}
        >
          All matches
        </Link>
      </div>

      {groupFixtures.length === 0 ? (
        <p className="status-message">{emptyMessage}</p>
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
