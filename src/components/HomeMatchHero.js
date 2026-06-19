import PropTypes from "prop-types";
import { getTeamDisplayName } from "../utils/data";
import KnockoutMatchLabel from "./KnockoutMatchLabel";
import CountdownTimer from "./CountdownTimer";
import { fixtureShape, teamShape } from "../propTypes";
import {
  formatFixtureDate,
  formatFixtureTime,
  parseFixtureInstant,
} from "../utils/timezone";

function HomeMatchHero({ fixture, homeTeam, awayTeam, timeZone, variant }) {
  const kickoff = parseFixtureInstant(fixture);

  return (
    <section className={`home-hero home-hero--${variant}`}>
      <div className="home-hero-eyebrow">
        {variant === "live" ? (
          <span className="home-hero-live-badge">
            <span className="home-hero-live-dot" aria-hidden="true" />
            Live now
          </span>
        ) : (
          "Countdown to kickoff"
        )}
        {fixture.isKnockout ? (
          <>
            {fixture.knockoutTag && (
              <KnockoutMatchLabel
                tag={fixture.knockoutTag}
                matchId={fixture.id}
                className="home-hero-knockout-label"
              />
            )}
          </>
        ) : (
          fixture.group && (
            <span className="home-hero-group">Group {fixture.group}</span>
          )
        )}
      </div>

      <div className="home-hero-teams">
        <div className="home-hero-team">
          <img
            className="home-hero-flag"
            src={`https://flagcdn.com/w160/${homeTeam.flagCode}.png`}
            alt=""
            width={48}
            height={36}
          />
          <span className="home-hero-team-name">
            {getTeamDisplayName(homeTeam.name)}
          </span>
        </div>

        <span className="home-hero-vs" aria-hidden="true">
          vs
        </span>

        <div className="home-hero-team">
          <img
            className="home-hero-flag"
            src={`https://flagcdn.com/w160/${awayTeam.flagCode}.png`}
            alt=""
            width={48}
            height={36}
          />
          <span className="home-hero-team-name">
            {getTeamDisplayName(awayTeam.name)}
          </span>
        </div>
      </div>

      <div className="home-hero-meta">
        <span className="home-hero-meta-line">
          {formatFixtureDate(fixture, timeZone)}
          <span className="home-hero-meta-sep" aria-hidden="true">
            {" · "}
          </span>
          {formatFixtureTime(fixture, timeZone)}
        </span>
        <span className="home-hero-meta-line home-hero-meta-venue">
          {fixture.venue}, {fixture.city}
        </span>
      </div>

      {variant === "countdown" && (
        <CountdownTimer targetDate={kickoff} hideDaysWhenZero />
      )}
    </section>
  );
}

HomeMatchHero.propTypes = {
  fixture: fixtureShape.isRequired,
  homeTeam: teamShape.isRequired,
  awayTeam: teamShape.isRequired,
  timeZone: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["live", "countdown"]).isRequired,
};

export default HomeMatchHero;
