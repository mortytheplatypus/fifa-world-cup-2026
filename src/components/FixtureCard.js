import PropTypes from 'prop-types';
import { useTimezone } from '../context/TimezoneContext';
import { useNow } from '../hooks/useNow';
import { fixtureShape, teamShape } from '../propTypes';
import { getFixtureStatus } from '../utils/fixtures';
import { getGoalsBySide } from '../utils/results';
import {
  formatFixtureDate,
  formatFixtureTime,
  parseFixtureInstant,
} from '../utils/timezone';

const STATUS_LABELS = {
  completed: 'FT',
  ongoing: 'Live',
  upcoming: 'Upcoming',
  past: 'Awaiting result',
};

function FixtureCard({
  fixture,
  homeTeam,
  awayTeam,
  showGroup = false,
  showDate = true,
}) {
  const { timeZone } = useTimezone();
  const now = useNow();
  const instant = parseFixtureInstant(fixture);
  const isoDateTime = instant.toISOString();
  const status = getFixtureStatus(fixture, now);
  const goals = fixture.goals ?? [];
  const { home: homeGoals, away: awayGoals } = getGoalsBySide(goals);
  const showScorers =
    (status === 'completed' || status === 'ongoing') && goals.length > 0;

  return (
    <article
      className={`fixture-card fixture-card--${status}${
        showDate ? ' fixture-card--show-date' : ''
      }`}
    >
      <div className="fixture-meta">
        <div className="fixture-meta-tags">
          {showGroup && fixture.group && (
            <span className="fixture-group">Group {fixture.group}</span>
          )}
          <span className={`fixture-status fixture-status--${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
        <time dateTime={isoDateTime}>
          {showDate && (
            <>
              {formatFixtureDate(fixture, timeZone)}
              {' · '}
            </>
          )}
          {formatFixtureTime(fixture, timeZone)}
        </time>
      </div>

      <div className="fixture-teams">
        <div className="fixture-team-block fixture-team-block--home">
          <div className="fixture-team home">
            <img
              src={`https://flagcdn.com/w40/${homeTeam.flagCode}.png`}
              alt=""
              width={32}
              height={24}
            />
            <span>{homeTeam.name}</span>
          </div>
          {showScorers && homeGoals.length > 0 && (
            <ul className="fixture-team-scorers" aria-label={`${homeTeam.name} goals`}>
              {homeGoals.map((goal) => (
                <li key={`${goal.scorer}-${goal.minute}`}>
                  {goal.scorer} {goal.minute}&apos;
                </li>
              ))}
            </ul>
          )}
        </div>

        {fixture.homeScore != null && fixture.awayScore != null ? (
          <span className="fixture-score">
            {fixture.homeScore} – {fixture.awayScore}
          </span>
        ) : (
          <span className="fixture-vs">vs</span>
        )}

        <div className="fixture-team-block fixture-team-block--away">
          <div className="fixture-team away">
            <img
              src={`https://flagcdn.com/w40/${awayTeam.flagCode}.png`}
              alt=""
              width={32}
              height={24}
            />
            <span>{awayTeam.name}</span>
          </div>
          {showScorers && awayGoals.length > 0 && (
            <ul className="fixture-team-scorers" aria-label={`${awayTeam.name} goals`}>
              {awayGoals.map((goal) => (
                <li key={`${goal.scorer}-${goal.minute}`}>
                  {goal.scorer} {goal.minute}&apos;
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="fixture-venue">
        {fixture.venue}, {fixture.city}
      </div>
    </article>
  );
}

FixtureCard.propTypes = {
  fixture: fixtureShape.isRequired,
  homeTeam: teamShape.isRequired,
  awayTeam: teamShape.isRequired,
  showGroup: PropTypes.bool,
  showDate: PropTypes.bool,
};

export default FixtureCard;
