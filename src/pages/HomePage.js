import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FixtureCard from "../components/FixtureCard";
import LoadingSpinner from "../components/LoadingSpinner";
import HomeMatchHero from "../components/HomeMatchHero";
import { useTimezone } from "../context/TimezoneContext";
import { useGroupsData } from "../hooks/useGroupsData";
import { getTeamById } from "../utils/data";
import {
  formatDateHeading,
  getLatestResults,
  getNextUpcomingFixture,
  getOngoingFixtures,
  getTodayDateKey,
  getUpcomingMatchesDay,
} from "../utils/fixtures";
import { getDisplayTimezoneLabel } from "../utils/timezone";

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
    [timeZone, now],
  );

  const latestResults = useMemo(
    () => getLatestResults(fixtures, timeZone, now),
    [fixtures, timeZone, now],
  );

  const ongoingFixtures = useMemo(
    () => getOngoingFixtures(fixtures, now),
    [fixtures, now],
  );

  const nextUpcomingFixture = useMemo(
    () => getNextUpcomingFixture(fixtures, now),
    [fixtures, now],
  );

  const heroFixture = ongoingFixtures[0] ?? nextUpcomingFixture ?? null;
  const heroVariant = ongoingFixtures.length > 0 ? "live" : "countdown";

  const upcomingMatchesDay = useMemo(
    () =>
      getUpcomingMatchesDay(fixtures, timeZone, now, {
        excludeFixtureId: heroFixture?.id ?? null,
      }),
    [fixtures, timeZone, now, heroFixture],
  );

  const timezoneLabel = getDisplayTimezoneLabel(timeZone);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const heroHomeTeam = heroFixture
    ? getTeamById(teams, heroFixture.homeTeam)
    : null;
  const heroAwayTeam = heroFixture
    ? getTeamById(teams, heroFixture.awayTeam)
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
        stackedLayout
      />
    );
  }

  return (
    <section className="page home-page">
      <header className="home-header">
        <div className="home-meta">
          <p className="home-timezone">
            Times in{" "}
            <span className="home-timezone-label">{timezoneLabel}</span>
          </p>
          <div className="home-today">
            <span className="home-today-label">Today</span>
            <time className="home-today-date" dateTime={todayKey}>
              {formatDateHeading(todayKey)}
            </time>
          </div>
        </div>
      </header>

      {heroFixture && heroHomeTeam && heroAwayTeam && (
        <HomeMatchHero
          fixture={heroFixture}
          homeTeam={heroHomeTeam}
          awayTeam={heroAwayTeam}
          timeZone={timeZone}
          variant={heroVariant}
        />
      )}

      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Upcoming matches</h2>
          {upcomingMatchesDay && (
            <span className="home-section-date">
              {formatDateHeading(upcomingMatchesDay.dateKey)}
            </span>
          )}
        </div>

        {upcomingMatchesDay ? (
          <div className="fixture-list">
            {upcomingMatchesDay.fixtures.map((fixture) =>
              renderFixture(fixture),
            )}
          </div>
        ) : (
          <p className="status-message home-empty">No upcoming matches.</p>
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
              renderFixture(fixture, { showDate: true }),
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
