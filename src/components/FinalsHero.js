import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getTeamDisplayName, getTeamPath } from '../utils/data';
import KnockoutMatchLabel from './KnockoutMatchLabel';
import CountdownTimer from './CountdownTimer';
import { KnockoutScoreLine } from './KnockoutScore';
import { fixtureShape, teamShape } from '../propTypes';
import { getGoalsBySide } from '../utils/results';
import {
  formatFixtureDate,
  formatFixtureTime,
  parseFixtureInstant,
} from '../utils/timezone';

const GOAL_EMOJI = '⚽';

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

function FinalsTrophy({ className = '', width = 160, height = 240 }) {
  return (
    <span className={`finals-hero-trophy-wrap ${className}`.trim()}>
      <span className="finals-hero-trophy-glow" aria-hidden="true" />
      <img
        className="finals-hero-trophy"
        src="/fifawctrophy.png"
        alt=""
        width={width}
        height={height}
      />
    </span>
  );
}

FinalsTrophy.propTypes = {
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

function FinalsScorers({ goals, side, teamLabel }) {
  if (!goals.length) {
    return null;
  }

  return (
    <ul
      className={`finals-hero-scorers finals-hero-scorers--${side}`}
      aria-label={`${teamLabel} goals`}
    >
      {goals.map((goal) => (
        <li key={`${goal.scorer}-${goal.minute}`}>
          {side === 'home' ? (
            <>
              <span className="finals-hero-goal-emoji" aria-hidden="true">
                {GOAL_EMOJI}
              </span>{' '}
              {goal.minute}&apos; {goal.scorer}
            </>
          ) : (
            <>
              {goal.scorer} {goal.minute}&apos;{' '}
              <span className="finals-hero-goal-emoji" aria-hidden="true">
                {GOAL_EMOJI}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

FinalsScorers.propTypes = {
  goals: PropTypes.arrayOf(
    PropTypes.shape({
      scorer: PropTypes.string.isRequired,
      minute: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ).isRequired,
  side: PropTypes.oneOf(['home', 'away']).isRequired,
  teamLabel: PropTypes.string.isRequired,
};

function FinalsHeroMeta({ fixture, timeZone }) {
  return (
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
  );
}

FinalsHeroMeta.propTypes = {
  fixture: fixtureShape.isRequired,
  timeZone: PropTypes.string.isRequired,
};

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
          <FinalsTrophy />
        </div>
        <p className="finals-hero-pending-message">Finalists to be confirmed</p>
      </section>
    );
  }

  const kickoff = parseFixtureInstant(fixture);
  const goals = fixture.goals ?? [];
  const { home: homeGoals, away: awayGoals } = getGoalsBySide(goals);
  const homeLabel = homeTeam?.name ?? fixture.homePlaceholder ?? 'TBD';
  const awayLabel = awayTeam?.name ?? fixture.awayPlaceholder ?? 'TBD';
  const hasScore = fixture.homeScore != null && fixture.awayScore != null;

  if (variant === 'winner' && winnerTeam) {
    return (
      <section className="finals-hero finals-hero--winner">
        <div className="finals-hero-eyebrow">World Champions</div>

        <div className="finals-hero-winner">
          <FinalsTrophy
            className="finals-hero-trophy-wrap--winner"
            width={140}
            height={210}
          />
          <Link
            to={getTeamPath(winnerTeam)}
            className="finals-hero-winner-team finals-hero-team--link"
          >
            <img
              className="finals-hero-flag finals-hero-flag--winner"
              src={`https://flagcdn.com/w160/${winnerTeam.flagCode}.png`}
              alt=""
              width={112}
              height={84}
            />
            <span className="finals-hero-winner-name">
              {getTeamDisplayName(winnerTeam.name)}
            </span>
          </Link>
          <p className="finals-hero-winner-subtitle">FIFA World Cup Champions</p>
          {hasScore && (
            <KnockoutScoreLine
              result={fixture}
              className="finals-hero-score"
              valueClassName="finals-hero-score-value"
            />
          )}
        </div>

        <FinalsHeroMeta fixture={fixture} timeZone={timeZone} />
      </section>
    );
  }

  if (variant === 'live') {
    return (
      <section className="finals-hero finals-hero--live">
        <div className="finals-hero-eyebrow">
          <span className="finals-hero-live-badge">
            <span className="finals-hero-live-dot" aria-hidden="true" />
            Live now
          </span>
          {fixture.knockoutTag && (
            <KnockoutMatchLabel
              tag={fixture.knockoutTag}
              matchId={fixture.id}
              className="finals-hero-knockout-label"
            />
          )}
        </div>

        <div className="finals-hero-live-matchup">
          <div className="finals-hero-live-side finals-hero-live-side--home">
            <FinalsTeamSide
              team={homeTeam}
              placeholder={fixture.homePlaceholder}
              className="finals-hero-team--live"
            />
            <FinalsScorers
              goals={homeGoals}
              side="home"
              teamLabel={homeLabel}
            />
          </div>

          {hasScore ? (
            <KnockoutScoreLine
              result={fixture}
              separator=" – "
              className="finals-hero-live-score"
              valueClassName="finals-hero-live-score-value"
            />
          ) : (
            <span className="finals-hero-live-vs" aria-hidden="true">
              vs
            </span>
          )}

          <div className="finals-hero-live-side finals-hero-live-side--away">
            <FinalsTeamSide
              team={awayTeam}
              placeholder={fixture.awayPlaceholder}
              className="finals-hero-team--live"
            />
            <FinalsScorers
              goals={awayGoals}
              side="away"
              teamLabel={awayLabel}
            />
          </div>
        </div>

        <p className="finals-hero-final-banner">The Final</p>
        <FinalsHeroMeta fixture={fixture} timeZone={timeZone} />
      </section>
    );
  }

  return (
    <section className="finals-hero finals-hero--countdown">
      <div className="finals-hero-eyebrow">
        Countdown to the Final
        {fixture.knockoutTag && (
          <KnockoutMatchLabel
            tag={fixture.knockoutTag}
            matchId={fixture.id}
            className="finals-hero-knockout-label"
          />
        )}
      </div>

      <div className="finals-hero-showcase">
        <FinalsTeamSide
          team={homeTeam}
          placeholder={fixture.homePlaceholder}
          className="finals-hero-team--home"
        />
        <FinalsTrophy />
        <FinalsTeamSide
          team={awayTeam}
          placeholder={fixture.awayPlaceholder}
          className="finals-hero-team--away"
        />
      </div>

      <p className="finals-hero-final-banner">The Final</p>

      <CountdownTimer targetDate={kickoff} hideDaysWhenZero />

      <FinalsHeroMeta fixture={fixture} timeZone={timeZone} />
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
