import { useMemo, useState } from 'react';
import DateNavigator from '../components/DateNavigator';
import FixtureCard from '../components/FixtureCard';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS } from '../utils/data';
import {
  filterFixturesByGroup,
  formatDateHeading,
  getDateKeys,
  groupFixturesByDate,
} from '../utils/fixtures';
import { getDisplayTimezoneLabel } from '../utils/timezone';

function FixturesPage() {
  const { timeZone } = useTimezone();
  const { teams, fixtures, loading, error } = useGroupsData();
  const [showAllDates, setShowAllDates] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('all');

  const filteredFixtures = useMemo(
    () => filterFixturesByGroup(fixtures, selectedGroup),
    [fixtures, selectedGroup]
  );

  const fixturesByDate = useMemo(
    () => groupFixturesByDate(filteredFixtures, timeZone),
    [filteredFixtures, timeZone]
  );

  const dates = useMemo(() => getDateKeys(fixturesByDate), [fixturesByDate]);
  const timezoneLabel = getDisplayTimezoneLabel(timeZone);

  if (loading) {
    return <p className="status-message fixtures-status">Loading fixtures…</p>;
  }

  if (error) {
    return <p className="status-message error fixtures-status">{error}</p>;
  }

  const currentDateIndex = Math.min(activeDateIndex, Math.max(dates.length - 1, 0));
  const currentDate = dates[currentDateIndex];
  const visibleFixtures = showAllDates ? null : fixturesByDate[currentDate] ?? [];
  const isGroupFiltered = selectedGroup !== 'all';

  function handleGroupChange(event) {
    setSelectedGroup(event.target.value);
    setActiveDateIndex(0);
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
        showGroup={!isGroupFiltered}
        showDate={false}
      />
    );
  }

  function renderFixturesContent() {
    if (dates.length === 0) {
      return (
        <p className="status-message fixtures-empty">
          No fixtures found for this group.
        </p>
      );
    }

    if (showAllDates) {
      return (
        <div className="fixtures-by-date">
          {dates.map((dateKey) => (
            <section key={dateKey} className="fixtures-date-section">
              <h2 className="fixtures-date-title">{formatDateHeading(dateKey)}</h2>
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
      <header className="fixtures-header">
        <div>
          <h1>Fixtures</h1>
          <p className="fixtures-timezone">
            Times shown in {timezoneLabel}
          </p>
        </div>

        <div className="fixtures-controls">
          <label className="fixtures-group-filter">
            <span className="fixtures-group-filter-label">Group</span>
            <select
              className="fixtures-group-select"
              value={selectedGroup}
              onChange={handleGroupChange}
            >
              <option value="all">All groups</option>
              {GROUP_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  Group {letter}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="fixtures-view-toggle"
            onClick={() => setShowAllDates((value) => !value)}
          >
            {showAllDates ? 'View by date' : 'View all dates'}
          </button>
        </div>
      </header>

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

export default FixturesPage;
