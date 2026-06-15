import { useEffect, useMemo, useState } from 'react';
import DateNavigator from '../components/DateNavigator';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import FixtureCard from '../components/FixtureCard';
import { useSettings } from '../context/SettingsContext';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupTeamFilters } from '../hooks/useGroupTeamFilters';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById, GROUP_LETTERS } from '../utils/data';
import {
  filterFixturesByGroup,
  filterFixturesByTeam,
  formatDateHeading,
  getDateKeys,
  getDefaultDateIndex,
  groupFixturesByDate,
} from '../utils/fixtures';
import { getDisplayTimezoneLabel } from '../utils/timezone';

function FixturesPage() {
  const { timeZone } = useTimezone();
  const { favoriteTeamId } = useSettings();
  const { teams, fixtures, loading, error } = useGroupsData();
  const [showAllDates, setShowAllDates] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const {
    selectedGroup,
    teamFilter,
    favoriteTeamName,
    handleGroupChange: onGroupChange,
    handleTeamFilterChange: onTeamFilterChange,
  } = useGroupTeamFilters(teams, favoriteTeamId);

  const filteredFixtures = useMemo(() => {
    let result = filterFixturesByGroup(fixtures, selectedGroup);

    if (teamFilter === 'favorite' && favoriteTeamId) {
      result = filterFixturesByTeam(result, favoriteTeamId);
    }

    return result;
  }, [fixtures, selectedGroup, teamFilter, favoriteTeamId]);

  const fixturesByDate = useMemo(
    () => groupFixturesByDate(filteredFixtures, timeZone),
    [filteredFixtures, timeZone]
  );

  const dates = useMemo(() => getDateKeys(fixturesByDate), [fixturesByDate]);
  const defaultDateIndex = useMemo(
    () => getDefaultDateIndex(dates, timeZone),
    [dates, timeZone]
  );
  const timezoneLabel = getDisplayTimezoneLabel(timeZone);

  useEffect(() => {
    setActiveDateIndex(defaultDateIndex);
  }, [defaultDateIndex, selectedGroup, teamFilter]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error fixtures-status">{error}</p>;
  }

  const currentDateIndex = Math.min(activeDateIndex, Math.max(dates.length - 1, 0));
  const currentDate = dates[currentDateIndex];
  const visibleFixtures = showAllDates
    ? null
    : [...(fixturesByDate[currentDate] ?? [])].reverse();
  const isGroupFiltered = selectedGroup !== 'all';

  function handleGroupChange(event) {
    onGroupChange(event);
  }

  function handleTeamFilterChange(event) {
    onTeamFilterChange(event);
  }

  function handlePreviousDate() {
    setActiveDateIndex((index) => Math.max(0, index - 1));
  }

  function handleNextDate() {
    setActiveDateIndex((index) => Math.min(dates.length - 1, index + 1));
  }

  function renderFixture(fixture, { stackedLayout = false } = {}) {
    return (
      <FixtureCard
        key={fixture.id}
        fixture={fixture}
        homeTeam={getTeamById(teams, fixture.homeTeam)}
        awayTeam={getTeamById(teams, fixture.awayTeam)}
        showGroup={!isGroupFiltered}
        showDate={false}
        stackedLayout={stackedLayout}
      />
    );
  }

  function renderFixturesContent() {
    if (dates.length === 0) {
      return (
        <p className="status-message fixtures-empty">
          No fixtures found for the selected filters.
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
        {visibleFixtures.map((fixture) =>
          renderFixture(fixture, { stackedLayout: true })
        )}
      </div>
    );
  }

  return (
    <section className="page fixtures-page">
      <header className="fixtures-header">
        <div>
          <h1>Fixtures</h1>
          <p className="fixtures-timezone">
            Times shown in{' '}
            <span className="home-timezone-label">{timezoneLabel}</span>
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

          <FavoriteTeamFilter
            teamName={favoriteTeamName}
            value={teamFilter}
            onChange={handleTeamFilterChange}
          />

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
