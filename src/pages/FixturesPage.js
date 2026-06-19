import { useEffect, useMemo, useState } from 'react';
import DateNavigator from '../components/DateNavigator';
import FavoriteTeamFilter from '../components/FavoriteTeamFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import FixtureCard from '../components/FixtureCard';
import { useSettings } from '../context/SettingsContext';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupTeamFilters } from '../hooks/useGroupTeamFilters';
import { useMatchSchedule } from '../hooks/useMatchSchedule';
import { getTeamById, GROUP_LETTERS } from '../utils/data';
import {
  filterFixturesByGroup,
  filterFixturesByTeam,
  formatDateHeading,
  getDateKeys,
  getDayFixturesDisplayOrder,
  getDefaultDateIndex,
  groupFixturesByDate,
} from '../utils/fixtures';
import { isKnockoutScheduleMode } from '../utils/knockoutConfig';
import { getDisplayTimezoneLabel } from '../utils/timezone';

function FixturesPage() {
  const { timeZone } = useTimezone();
  const { favoriteTeamId } = useSettings();
  const { teams, fixtures, groupFixtures, loading, error } = useMatchSchedule();
  const knockoutMode = isKnockoutScheduleMode();
  const [scheduleTab, setScheduleTab] = useState('knockout');
  const [showAllDates, setShowAllDates] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const {
    selectedGroup,
    teamFilter,
    favoriteTeamName,
    handleGroupChange: onGroupChange,
    handleTeamFilterChange: onTeamFilterChange,
  } = useGroupTeamFilters(teams, favoriteTeamId);

  const activeFixtures =
    knockoutMode && scheduleTab === 'knockout' ? fixtures : groupFixtures;

  const filteredFixtures = useMemo(() => {
    if (knockoutMode && scheduleTab === 'knockout') {
      return activeFixtures;
    }

    let result = filterFixturesByGroup(activeFixtures, selectedGroup);

    if (teamFilter === 'favorite' && favoriteTeamId) {
      result = filterFixturesByTeam(result, favoriteTeamId);
    }

    return result;
  }, [
    activeFixtures,
    selectedGroup,
    teamFilter,
    favoriteTeamId,
    knockoutMode,
    scheduleTab,
  ]);

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
  const showGroupFilters = !knockoutMode || scheduleTab === 'groups';

  useEffect(() => {
    setActiveDateIndex(defaultDateIndex);
  }, [defaultDateIndex, selectedGroup, teamFilter, scheduleTab]);

  useEffect(() => {
    if (knockoutMode) {
      setShowAllDates(false);
    }
  }, [scheduleTab, knockoutMode]);

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
    : getDayFixturesDisplayOrder(fixturesByDate[currentDate] ?? []);
  const isGroupFiltered = selectedGroup !== 'all';
  const isKnockoutTab = knockoutMode && scheduleTab === 'knockout';

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
        showGroup={isKnockoutTab || !isGroupFiltered}
        showDate={false}
        stackedLayout={stackedLayout}
      />
    );
  }

  function renderFixturesContent() {
    if (dates.length === 0) {
      return (
        <p className="status-message fixtures-empty">
          {isKnockoutTab
            ? 'No knockout matches available yet.'
            : 'No fixtures found for the selected filters.'}
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

        {showGroupFilters && (
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
        )}

        {isKnockoutTab && (
          <div className="fixtures-controls">
            <button
              type="button"
              className="fixtures-view-toggle"
              onClick={() => setShowAllDates((value) => !value)}
            >
              {showAllDates ? 'View by date' : 'View all dates'}
            </button>
          </div>
        )}
      </header>

      {knockoutMode && (
        <div
          className="fixtures-schedule-tabs home-fixtures-tabs"
          role="tablist"
          aria-label="Fixture schedule"
        >
          <button
            type="button"
            role="tab"
            className={`home-fixtures-tab${
              scheduleTab === 'knockout' ? ' active' : ''
            }`}
            aria-selected={scheduleTab === 'knockout'}
            onClick={() => setScheduleTab('knockout')}
          >
            Knockout
          </button>
          <button
            type="button"
            role="tab"
            className={`home-fixtures-tab${
              scheduleTab === 'groups' ? ' active' : ''
            }`}
            aria-selected={scheduleTab === 'groups'}
            onClick={() => setScheduleTab('groups')}
          >
            Group stage
          </button>
        </div>
      )}

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
