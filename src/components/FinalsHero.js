import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getTeamDisplayName, getTeamPath } from '../utils/data';
import KnockoutMatchLabel from './KnockoutMatchLabel';
import CountdownTimer from './CountdownTimer';
import { KnockoutScoreLine } from './KnockoutScore';
import { fixtureShape, teamShape } from '../propTypes';
import {
  formatFixtureDate,
  formatFixtureTime,
  parseFixtureInstant,
} from '../utils/timezone';

function FinalsTeamSide({ team, placeholder, className = '' }) {
  const name = team
    ? getTeamDisplayName(team.name)
    : (placeholder ?? 'TBD');

  if (!team) {
    return (
      <div
        className={`finals-hero-team finals-hero-team--placeholder ${className}`.trim()}
      >
        <span className="finals-hero-flag finals-hero-flag--placeholder" aria-hidden="true" />
        <span className="finals-hero-team-name">{name}</span>
      </div>
    );
  }

  return (
    <Link
      to={getTeamPath(team)}
      className={`finals-hero-team finals-hero-team--link ${className}`.trim()}
    >
      <img
        className="finals-hero-flag"
        src={`https://flagcdn.com/w160/${team.flagCode}.png`}
        alt=""
        width={80}
        height={60}
      />
      <span className="finals-hero-team-name">{name}</span>
    </Link>
  );
}

FinalsTeamSide.propTypes = {
  team: teamShape,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

function getEyebrowLabel(variant) {
  if (variant === 'winner') {
    return 'World Champions';
  }
  if (variant === 'live') {
    return 'The Final — Live';
  }
  return 'Countdown to the Final';
}

function FinalsHero({
  fixture,
  homeTeam,
  awayTeam,
  timeZone,
  variant,
  winnerTeam = null,
}) {
  if (!fixture) {
    return (
      <section className="finals-hero finals-hero--pending">
        <p className="finals-hero-final-banner">The Final</p>
        <div className="finals-hero-showcase finals-hero-showcase--pending">
          <img
            className="finals-hero-trophy"
            src="/fifawctrophy.png"
            alt=""
            width={160}
            height={240}
          />
        </div>
        <p className="finals-hero-pending-message">Finalists to be confirmed</p>
      </section>
    );
  }

  const kickoff = parseFixtureInstant(fixture);
  const eyebrowLabel = getEyebrowLabel(variant);
  const showWinner = variant === 'winner' && winnerTeam;

  return (
    <section className={`finals-hero finals-hero--${variant}`}>
      <div className="finals-hero-eyebrow">
        {variant === 'live' ? (
          <span className="finals-hero-live-badge">
            <span className="finals-hero-live-dot" aria-hidden="true" />
            Live now
          </span>
        ) : (
          eyebrowLabel
        )}
        {fixture.knockoutTag && (
          <KnockoutMatchLabel
            tag={fixture.knockoutTag}
            matchId={fixture.id}
            className="finals-hero-knockout-label"
          />
        )}
      </div>

      {showWinner ? (
        <div className="finals-hero-winner">
          <img
            className="finals-hero-trophy finals-hero-trophy--winner"
            src="/fifawctrophy.png"
            alt=""
            width={120}
            height={180}
          />
          <Link
            to={getTeamPath(winnerTeam)}
            className="finals-hero-winner-team finals-hero-team--link"
          >
            <img
              className="finals-hero-flag finals-hero-flag--winner"
              src={`https://flagcdn.com/w160/${winnerTeam.flagCode}.png`}
              alt=""
              width={96}
              height={72}
            />
            <span className="finals-hero-winner-name">
              {getTeamDisplayName(winnerTeam.name)}
            </span>
          </Link>
          <KnockoutScoreLine
            result={fixture}
            className="finals-hero-score"
            valueClassName="finals-hero-score-value"
          />
        </div>
      ) : (
        <>
          <div className="finals-hero-showcase">
            <FinalsTeamSide
              team={homeTeam}
              placeholder={fixture.homePlaceholder}
              className="finals-hero-team--home"
            />
            <img
              className="finals-hero-trophy"
              src="/fifawctrophy.png"
              alt=""
              width={160}
              height={240}
            />
            <FinalsTeamSide
              team={awayTeam}
              placeholder={fixture.awayPlaceholder}
              className="finals-hero-team--away"
            />
          </div>

          <p className="finals-hero-final-banner">The Final</p>

          <div className="finals-hero-meta">
            <span className="finals-hero-meta-line">
              {formatFixtureDate(fixture, timeZone)}
              <span className="finals-hero-meta-sep" aria-hidden="true">
                {' · '}
              </span>
              {formatFixtureTime(fixture, timeZone)}
            </span>
            <span className="finals-hero-meta-line finals-hero-meta-venue">
              {fixture.venue}, {fixture.city}
            </span>
          </div>

          {variant === 'countdown' && (
            <CountdownTimer targetDate={kickoff} hideDaysWhenZero />
          )}
        </>
      )}
    </section>
  );
}

FinalsHero.propTypes = {
  fixture: fixtureShape,
  homeTeam: teamShape,
  awayTeam: teamShape,
  timeZone: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['countdown', 'live', 'winner']).isRequired,
  winnerTeam: teamShape,
};

export default FinalsHero;
