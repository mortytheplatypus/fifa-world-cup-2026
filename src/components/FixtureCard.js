import PropTypes from 'prop-types';
import { useTimezone } from '../context/TimezoneContext';
import { useNow } from '../hooks/useNow';
import { fixtureShape, teamShape } from '../propTypes';
import { getFixtureStatus } from '../utils/fixtures';
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

  return (
    <article className={`fixture-card fixture-card--${status}`}>
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
        <div className="fixture-team home">
          <img
            src={`https://flagcdn.com/w40/${homeTeam.flagCode}.png`}
            alt=""
            width={32}
            height={24}
          />
          <span>{homeTeam.name}</span>
        </div>
        {fixture.homeScore != null && fixture.awayScore != null ? (
          <span className="fixture-score">
            {fixture.homeScore} – {fixture.awayScore}
          </span>
        ) : (
          <span className="fixture-vs">vs</span>
        )}
        <div className="fixture-team away">
          <img
            src={`https://flagcdn.com/w40/${awayTeam.flagCode}.png`}
            alt=""
            width={32}
            height={24}
          />
          <span>{awayTeam.name}</span>
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
