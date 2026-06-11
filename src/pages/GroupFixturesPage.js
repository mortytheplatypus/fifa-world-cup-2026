import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import DateNavigator from '../components/DateNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import FixtureCard from '../components/FixtureCard';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS, isValidGroup } from '../utils/data';
import {
  formatDateHeading,
  getDateKeys,
  groupFixturesByDate,
  sortFixtures,
  splitFixturesByDate,
} from '../utils/fixtures';

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
  const { timeZone } = useTimezone();
  const { groupId: rawGroupId, view: rawView } = useParams();
  const groupId = rawGroupId?.toUpperCase();
  const view = rawView?.toLowerCase();
  const { teams, fixtures, loading, error } = useGroupsData();
  const [showAllDates, setShowAllDates] = useState(true);
  const [activeDateIndex, setActiveDateIndex] = useState(0);

  const groupFixturesList = fixtures[groupId] ?? [];
  const { upcoming } = splitFixturesByDate(groupFixturesList);
  const groupFixtures =
    view === 'upcoming' ? upcoming : sortFixtures(groupFixturesList);

  const fixturesByDate = useMemo(
    () => groupFixturesByDate({ [groupId]: groupFixtures }, timeZone),
    [groupFixtures, groupId, timeZone]
  );

  const dates = useMemo(() => getDateKeys(fixturesByDate), [fixturesByDate]);

  useEffect(() => {
    setActiveDateIndex(0);
  }, [groupId, view]);

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
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const { title, breadcrumb, emptyMessage } = VIEW_CONFIG[view];
  const currentDateIndex = Math.min(
    activeDateIndex,
    Math.max(dates.length - 1, 0)
  );
  const currentDate = dates[currentDateIndex];
  const visibleFixtures = showAllDates
    ? null
    : fixturesByDate[currentDate] ?? [];

  function handleGroupChange(event) {
    navigate(`/groups/${event.target.value}/fixtures/${view}`);
  }

  function handlePreviousDate() {
    setActiveDateIndex((index) => Math.max(0, index - 1));
  }

  function handleNextDate() {
    setActiveDateIndex((index) => Math.min(dates.length - 1, index + 1));
  }

  function renderFixture(fixture) {
    return (
      <FixtureCard
        key={fixture.id}
        fixture={fixture}
        homeTeam={getTeamById(teams, fixture.homeTeam)}
        awayTeam={getTeamById(teams, fixture.awayTeam)}
        showDate={false}
      />
    );
  }

  function renderFixturesContent() {
    if (dates.length === 0) {
      return <p className="status-message">{emptyMessage}</p>;
    }

    if (showAllDates) {
      return (
        <div className="fixtures-by-date">
          {dates.map((dateKey) => (
            <section key={dateKey} className="fixtures-date-section">
              <h2 className="fixtures-date-title">
                {formatDateHeading(dateKey)}
              </h2>
              <div className="fixture-list">
                {fixturesByDate[dateKey].map(renderFixture)}
              </div>
            </section>
          ))}
        </div>
      );
    }

    return (
      <div className="fixture-list">
        {visibleFixtures.map(renderFixture)}
      </div>
    );
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
        <h1>
          Group {groupId} : <i>{title}</i>
        </h1>

        <div className="group-page-controls">
          {dates.length > 0 && (
            <button
              type="button"
              className="fixtures-view-toggle"
              onClick={() => setShowAllDates((value) => !value)}
            >
              {showAllDates ? 'View by date' : 'View all dates'}
            </button>
          )}

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
        </div>
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

      {!showAllDates && dates.length > 0 && (
        <DateNavigator
          dateLabel={formatDateHeading(currentDate)}
          onPrevious={handlePreviousDate}
          onNext={handleNextDate}
          canGoPrevious={currentDateIndex > 0}
          canGoNext={currentDateIndex < dates.length - 1}
        />
      )}

      {renderFixturesContent()}
    </section>
  );
}

export default GroupFixturesPage;
