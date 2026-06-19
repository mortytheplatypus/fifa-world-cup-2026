import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FixtureCard from "../components/FixtureCard";
import LoadingSpinner from "../components/LoadingSpinner";
import HomeMatchHero from "../components/HomeMatchHero";
import { useTimezone } from "../context/TimezoneContext";
import { useMatchSchedule } from "../hooks/useMatchSchedule";
import { getTeamById } from "../utils/data";
import { isKnockoutScheduleMode } from "../utils/knockoutConfig";
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
  const { teams, fixtures, loading, error } = useMatchSchedule();
  const knockoutMode = isKnockoutScheduleMode();
  const [now, setNow] = useState(() => new Date());
  const [activeMatchesTab, setActiveMatchesTab] = useState("upcoming");

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
        showGroup={!fixture.isKnockout}
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

      <section className="home-section home-matches-section">
        <div className="home-matches-header">
          <div className="home-fixtures-tabs" role="tablist" aria-label="Matches">
            <button
              type="button"
              role="tab"
              id="home-matches-tab-upcoming"
              className={`home-fixtures-tab${
                activeMatchesTab === "upcoming" ? " active" : ""
              }`}
              aria-selected={activeMatchesTab === "upcoming"}
              aria-controls="home-matches-panel-upcoming"
              onClick={() => setActiveMatchesTab("upcoming")}
            >
              Upcoming matches
            </button>
            <button
              type="button"
              role="tab"
              id="home-matches-tab-results"
              className={`home-fixtures-tab${
                activeMatchesTab === "results" ? " active" : ""
              }`}
              aria-selected={activeMatchesTab === "results"}
              aria-controls="home-matches-panel-results"
              onClick={() => setActiveMatchesTab("results")}
            >
              Latest results
            </button>
          </div>

          {activeMatchesTab === "upcoming" && upcomingMatchesDay && (
            <span className="home-section-date">
              {formatDateHeading(upcomingMatchesDay.dateKey)}
            </span>
          )}
          {activeMatchesTab === "results" && latestResults && (
            <span className="home-section-date">
              {formatDateHeading(latestResults.dateKey)}
            </span>
          )}
        </div>

        <div
          role="tabpanel"
          id="home-matches-panel-upcoming"
          className="home-matches-panel"
          aria-labelledby="home-matches-tab-upcoming"
          hidden={activeMatchesTab !== "upcoming"}
        >
          {upcomingMatchesDay ? (
            <div className="fixture-list home-matches-list">
              {upcomingMatchesDay.fixtures.map((fixture) =>
                renderFixture(fixture),
              )}
            </div>
          ) : (
            <p className="status-message home-empty">No upcoming matches.</p>
          )}
        </div>

        <div
          role="tabpanel"
          id="home-matches-panel-results"
          className="home-matches-panel"
          aria-labelledby="home-matches-tab-results"
          hidden={activeMatchesTab !== "results"}
        >
          {latestResults ? (
            <div className="fixture-list home-matches-list">
              {latestResults.fixtures.map((fixture) =>
                renderFixture(fixture, { showDate: true }),
              )}
            </div>
          ) : (
            <p className="status-message home-empty">No results yet.</p>
          )}
        </div>
      </section>

      <div className="home-quick-links">
        <Link to="/fixtures" className="link-button">
          All fixtures
        </Link>
        {knockoutMode ? (
          <Link to="/knockout" className="link-button secondary">
            View bracket
          </Link>
        ) : (
          <Link to="/groups" className="link-button secondary">
            View groups
          </Link>
        )}
      </div>
    </section>
  );
}

export default HomePage;
