import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FixtureCard from "../components/FixtureCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FinalsHero from "../components/FinalsHero";
import HomeMatchHero from "../components/HomeMatchHero";
import { useTimezone } from "../context/TimezoneContext";
import { useMatchSchedule } from "../hooks/useMatchSchedule";
import { getTeamById } from "../utils/data";
import {
  FINALS_MATCH_IDS,
  getFinalsHeroVariant,
  getFinalsStageResults,
  getFinalsUpcomingFixtures,
  getFinalWinnerTeam,
  getFixtureById,
  isFinalsMode,
} from "../utils/finalsMode";
import { isKnockoutScheduleMode } from "../utils/knockoutConfig";
import {
  formatDateHeading,
  getFixtureDateKey,
  getFixtureStatus,
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

  const finalsMode = useMemo(
    () => isFinalsMode(timeZone, now),
    [timeZone, now],
  );

  const finalFixture = useMemo(
    () => (finalsMode ? getFixtureById(fixtures, FINALS_MATCH_IDS.FINAL) : null),
    [finalsMode, fixtures],
  );

  const finalsStageResults = useMemo(
    () => (finalsMode ? getFinalsStageResults(fixtures, now) : []),
    [finalsMode, fixtures, now],
  );

  const finalsUpcomingFixtures = useMemo(
    () => (finalsMode ? getFinalsUpcomingFixtures(fixtures, now) : []),
    [finalsMode, fixtures, now],
  );

  const useFinalsTabs =
    finalsMode && finalsUpcomingFixtures.length > 0;

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
        excludeFixtureId: finalsMode
          ? FINALS_MATCH_IDS.FINAL
          : (heroFixture?.id ?? null),
      }),
    [fixtures, timeZone, now, heroFixture, finalsMode],
  );

  const finalsUpcomingDay = useMemo(() => {
    if (!useFinalsTabs || finalsUpcomingFixtures.length === 0) {
      return null;
    }

    const dateKeys = [
      ...new Set(
        finalsUpcomingFixtures.map((fixture) =>
          getFixtureDateKey(fixture, timeZone),
        ),
      ),
    ].sort();

    return {
      dateKey: dateKeys[0],
      fixtures: finalsUpcomingFixtures,
      spansMultipleDays: dateKeys.length > 1,
    };
  }, [useFinalsTabs, finalsUpcomingFixtures, timeZone]);

  const upcomingForTabs = finalsMode ? finalsUpcomingDay : upcomingMatchesDay;
  const resultsForTabs = finalsMode
    ? finalsStageResults.length > 0
      ? { fixtures: finalsStageResults }
      : null
    : latestResults;

  useEffect(() => {
    if (finalsMode && !useFinalsTabs) {
      setActiveMatchesTab("results");
    }
  }, [finalsMode, useFinalsTabs]);

  const timezoneLabel = getDisplayTimezoneLabel(timeZone);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  const finalHomeTeam = finalFixture
    ? getTeamById(teams, finalFixture.homeTeam)
    : null;
  const finalAwayTeam = finalFixture
    ? getTeamById(teams, finalFixture.awayTeam)
    : null;
  const finalsHeroVariant = getFinalsHeroVariant(finalFixture, now);
  const finalWinnerTeam =
    finalsHeroVariant === "winner"
      ? getFinalWinnerTeam(finalFixture, finalHomeTeam, finalAwayTeam)
      : null;
  const showFinalResultCard =
    finalsMode &&
    finalFixture &&
    getFixtureStatus(finalFixture, now) === "completed";

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

  function renderMatchesTabs({
    upcoming,
    results,
    showResultsDate = true,
  }) {
    return (
      <>
        <div className="home-matches-header">
          <div
            className="home-fixtures-tabs"
            role="tablist"
            aria-label="Matches"
          >
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

          {activeMatchesTab === "upcoming" &&
            upcoming &&
            !upcoming.spansMultipleDays && (
              <span className="home-section-date">
                {formatDateHeading(upcoming.dateKey)}
              </span>
            )}
          {activeMatchesTab === "results" &&
            showResultsDate &&
            results?.dateKey && (
              <span className="home-section-date">
                {formatDateHeading(results.dateKey)}
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
          {upcoming ? (
            <div className="fixture-list home-matches-list">
              {upcoming.fixtures.map((fixture) =>
                renderFixture(fixture, {
                  showDate: upcoming.spansMultipleDays,
                }),
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
          {results?.fixtures?.length ? (
            <div className="fixture-list home-matches-list">
              {results.fixtures.map((fixture) =>
                renderFixture(fixture, { showDate: true }),
              )}
            </div>
          ) : (
            <p className="status-message home-empty">No results yet.</p>
          )}
        </div>
      </>
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

      {finalsMode ? (
        <>
          <FinalsHero
            fixture={finalFixture}
            homeTeam={finalHomeTeam}
            awayTeam={finalAwayTeam}
            timeZone={timeZone}
            variant={finalsHeroVariant ?? "countdown"}
            winnerTeam={finalWinnerTeam}
          />
          {showFinalResultCard && (
            <div className="home-finals-result">
              {renderFixture(finalFixture, { showDate: true })}
            </div>
          )}
        </>
      ) : (
        heroFixture &&
        heroHomeTeam &&
        heroAwayTeam && (
          <HomeMatchHero
            fixture={heroFixture}
            homeTeam={heroHomeTeam}
            awayTeam={heroAwayTeam}
            timeZone={timeZone}
            variant={heroVariant}
          />
        )
      )}

      <section className="home-section home-matches-section">
        {finalsMode && !useFinalsTabs ? (
          <>
            <div className="home-matches-header">
              <h2 className="home-finals-results-heading">Latest results</h2>
            </div>
            <div className="home-matches-panel">
              {finalsStageResults.length > 0 ? (
                <div className="fixture-list home-matches-list">
                  {finalsStageResults.map((fixture) =>
                    renderFixture(fixture, { showDate: true }),
                  )}
                </div>
              ) : (
                <p className="status-message home-empty">No results yet.</p>
              )}
            </div>
          </>
        ) : (
          renderMatchesTabs({
            upcoming: upcomingForTabs,
            results: resultsForTabs,
            showResultsDate: !finalsMode,
          })
        )}
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
