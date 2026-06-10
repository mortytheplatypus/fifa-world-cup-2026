import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import FixtureCard from '../components/FixtureCard';
import { useTimezone } from '../context/TimezoneContext';
import { useGroupsData } from '../hooks/useGroupsData';
import { getTeamById } from '../utils/data';
import {
  formatDateHeading,
  getFirstFixture,
  getFixturesOnDate,
  getLatestResults,
  getTodayDateKey,
  isTournamentStarted,
} from '../utils/fixtures';
import {
  formatFixtureDate,
  formatFixtureTime,
  getDisplayTimezoneLabel,
  parseFixtureInstant,
} from '../utils/timezone';

function HomePage() {
  const { timeZone } = useTimezone();
  const { teams, fixtures, loading, error } = useGroupsData();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const todayKey = useMemo(
    () => getTodayDateKey(timeZone, now),
    [timeZone, now]
  );

  const todayFixtures = useMemo(
    () => getFixturesOnDate(fixtures, todayKey, timeZone),
    [fixtures, todayKey, timeZone]
  );

  const latestResults = useMemo(
    () => getLatestResults(fixtures, timeZone, now),
    [fixtures, timeZone, now]
  );

  const firstFixture = useMemo(() => getFirstFixture(fixtures), [fixtures]);
  const tournamentStarted = useMemo(
    () => isTournamentStarted(fixtures, now),
    [fixtures, now]
  );

  const timezoneLabel = getDisplayTimezoneLabel(timeZone);

  if (loading) {
    return <p className="status-message">Loading…</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const firstKickoff = firstFixture ? parseFixtureInstant(firstFixture) : null;
  const firstHomeTeam = firstFixture
    ? getTeamById(teams, firstFixture.homeTeam)
    : null;
  const firstAwayTeam = firstFixture
    ? getTeamById(teams, firstFixture.awayTeam)
    : null;

  function renderFixture(fixture, options = {}) {
    return (
      <FixtureCard
        key={fixture.id}
        fixture={fixture}
        homeTeam={getTeamById(teams, fixture.homeTeam)}
        awayTeam={getTeamById(teams, fixture.awayTeam)}
        showGroup
        showDate={options.showDate ?? false}
      />
    );
  }

  return (
    <section className="page home-page">
      <header className="home-header">
        <h1>FIFA World Cup 2026</h1>
        <p className="home-subtitle">
          USA · Canada · Mexico
        </p>
        <p className="fixtures-timezone">
          Times shown in {timezoneLabel}
        </p>
      </header>

      {!tournamentStarted && firstFixture && firstKickoff && (
        <section className="home-countdown-card">
          <p className="home-countdown-eyebrow">Countdown to kickoff</p>
          <h2 className="home-countdown-match">
            {firstHomeTeam.name} vs {firstAwayTeam.name}
          </h2>
          <p className="home-countdown-meta">
            {formatFixtureDate(firstFixture, timeZone)}
            {' · '}
            {formatFixtureTime(firstFixture, timeZone)}
            {' · '}
            {firstFixture.venue}, {firstFixture.city}
          </p>
          <CountdownTimer targetDate={firstKickoff} />
        </section>
      )}

      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Today&apos;s matches</h2>
          <span className="home-section-date">{formatDateHeading(todayKey)}</span>
        </div>

        {todayFixtures.length === 0 ? (
          <p className="status-message home-empty">
            No matches scheduled for today.
          </p>
        ) : (
          <div className="fixture-list">
            {todayFixtures.map((fixture) => renderFixture(fixture))}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Latest results</h2>
          {latestResults && (
            <span className="home-section-date">
              {formatDateHeading(latestResults.dateKey)}
            </span>
          )}
        </div>

        {latestResults ? (
          <div className="fixture-list">
            {latestResults.fixtures.map((fixture) =>
              renderFixture(fixture, { showDate: true })
            )}
          </div>
        ) : (
          <p className="status-message home-empty">No results yet.</p>
        )}
      </section>

      <div className="home-quick-links">
        <Link to="/fixtures" className="link-button">
          All fixtures
        </Link>
        <Link to="/groups" className="link-button secondary">
          View groups
        </Link>
      </div>
    </section>
  );
}

export default HomePage;
