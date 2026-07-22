import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTimezone } from '../context/TimezoneContext';
import { useNow } from '../hooks/useNow';
import { getTeamDisplayName, getTeamPath } from '../utils/data';
import KnockoutMatchLabel from './KnockoutMatchLabel';
import { KnockoutScoreLine } from './KnockoutScore';
import { fixtureShape, teamShape } from '../propTypes';
import { getFixtureStatus } from '../utils/fixtures';
import { getCardDisplay, getCardPlayerName, getCardsBySide, getGoalsBySide } from '../utils/results';
import {
  formatFixtureDate,
  formatFixtureTime,
  parseFixtureInstant,
} from "../utils/timezone";

const STATUS_LABELS = {
  completed: "FT",
  ongoing: "Live",
  upcoming: "Upcoming",
  past: "Awaiting result",
};

const GOAL_EMOJI = "⚽";

function FixtureTeamLabel({ team, placeholder, side }) {
  const name = team
    ? getTeamDisplayName(team.name)
    : (placeholder ?? "TBD");

  if (!team) {
    return (
      <span className={`fixture-team-label fixture-team-label--placeholder fixture-team-label--${side}`}>
        <span
          className={`fixture-team-flag fixture-team-flag--placeholder fixture-team-flag--${side}`}
          aria-hidden="true"
        />
        <span className={`fixture-team-name fixture-team-name--${side}`}>
          {name}
        </span>
      </span>
    );
  }

  return (
    <Link
      to={getTeamPath(team)}
      className="fixture-team-label fixture-team-label--link"
    >
      <img
        className={`fixture-team-flag fixture-team-flag--${side}`}
        src={`https://flagcdn.com/w40/${team.flagCode}.png`}
        alt=""
        width={32}
        height={24}
      />
      <span className={`fixture-team-name fixture-team-name--${side}`}>
        {name}
      </span>
    </Link>
  );
}

FixtureTeamLabel.propTypes = {
  team: teamShape,
  placeholder: PropTypes.string,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
};

function GoalList({ goals, side, teamLabel }) {
  return (
    <ul
      className={`fixture-team-scorers fixture-team-scorers--${side}`}
      aria-label={`${teamLabel} goals`}
    >
      {goals.map((goal) => (
        <li key={`${goal.scorer}-${goal.minute}`}>
          {side === "home" ? (
            <>
              <span className="fixture-goal-emoji" aria-hidden="true">
                {GOAL_EMOJI}
              </span>{" "}
              {goal.minute}&apos; {goal.scorer}
            </>
          ) : (
            <>
              {goal.scorer} {goal.minute}&apos;{" "}
              <span className="fixture-goal-emoji" aria-hidden="true">
                {GOAL_EMOJI}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

GoalList.propTypes = {
  goals: PropTypes.arrayOf(PropTypes.object).isRequired,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
  teamLabel: PropTypes.string.isRequired,
};

function CardList({ cards, side, teamLabel }) {
  return (
    <ul
      className={`fixture-team-cards fixture-team-cards--${side}`}
      aria-label={`${teamLabel} cards`}
    >
      {cards.map((card, index) => {
        const { emoji, label } = getCardDisplay(card);
        const player = getCardPlayerName(card);
        return (
          <li key={`${card.type}-${player ?? index}-${index}`}>
            {side === "home" ? (
              <>
                <span className="fixture-card-emoji" aria-hidden="true">
                  {emoji}
                </span>
                {card.minute != null && <> {card.minute}&apos;</>}
                {player ? <> {player}</> : <> {label}</>}
              </>
            ) : (
              <>
                {player ?? label}
                {card.minute != null && <> {card.minute}&apos;</>}{" "}
                <span className="fixture-card-emoji" aria-hidden="true">
                  {emoji}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

CardList.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
  teamLabel: PropTypes.string.isRequired,
};

function FixtureCard({
  fixture,
  homeTeam,
  awayTeam,
  showGroup = false,
  showDate = true,
  stackedLayout = false,
}) {
  const { timeZone } = useTimezone();
  const now = useNow();
  const instant = parseFixtureInstant(fixture);
  const isoDateTime = instant.toISOString();
  const timeStatus = getFixtureStatus(fixture, now);
  const hasResult = fixture.homeScore != null && fixture.awayScore != null;
  const status =
    hasResult && timeStatus === "upcoming" ? "completed" : timeStatus;
  const goals = fixture.goals ?? [];
  const cards = fixture.cards ?? [];
  const { home: homeGoals, away: awayGoals } = getGoalsBySide(goals);
  const { home: homeCards, away: awayCards } = getCardsBySide(cards);
  const showMatchEvents = status === "completed" || status === "ongoing";
  const showScorers = showMatchEvents && goals.length > 0;
  const showCards = showMatchEvents && cards.length > 0;
  const homeLabel = homeTeam?.name ?? fixture.homePlaceholder ?? "TBD";
  const awayLabel = awayTeam?.name ?? fixture.awayPlaceholder ?? "TBD";
  const isFinal = fixture.round === "final" || fixture.id === "M104";

  return (
    <article
      className={`fixture-card fixture-card--${status}${
        showDate ? " fixture-card--show-date" : ""
      }${stackedLayout ? " fixture-card--stacked" : ""}${
        isFinal ? " fixture-card--final" : ""
      }`}
    >
      <div className="fixture-meta">
        <div className="fixture-meta-tags">
          {fixture.isKnockout && fixture.knockoutTag && (
            <KnockoutMatchLabel
              tag={fixture.knockoutTag}
              matchId={fixture.id}
              className="fixture-knockout-label"
            />
          )}
          {!fixture.isKnockout && showGroup && fixture.group && (
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
              {" · "}
            </>
          )}
          {formatFixtureTime(fixture, timeZone)}
        </time>
      </div>

      <div className="fixture-teams">
        <div className="fixture-team-side fixture-team-side--home">
          <FixtureTeamLabel
            team={homeTeam}
            placeholder={fixture.homePlaceholder}
            side="home"
          />
        </div>

        {fixture.homeScore != null && fixture.awayScore != null ? (
          fixture.isKnockout && fixture.penalties ? (
            <KnockoutScoreLine
              result={fixture}
              separator=" – "
              className="fixture-score"
            />
          ) : (
            <span className="fixture-score">
              {fixture.homeScore} – {fixture.awayScore}
            </span>
          )
        ) : (
          <span className="fixture-vs">vs</span>
        )}

        <div className="fixture-team-side fixture-team-side--away">
          <FixtureTeamLabel
            team={awayTeam}
            placeholder={fixture.awayPlaceholder}
            side="away"
          />
        </div>

        {showScorers && (
          <div className="fixture-events-row fixture-events-row--goals">
            <div className="fixture-events-side fixture-events-side--home">
              {homeGoals.length > 0 && (
                <GoalList goals={homeGoals} side="home" teamLabel={homeLabel} />
              )}
            </div>
            <span className="fixture-events-gap" aria-hidden="true" />
            <div className="fixture-events-side fixture-events-side--away">
              {awayGoals.length > 0 && (
                <GoalList goals={awayGoals} side="away" teamLabel={awayLabel} />
              )}
            </div>
          </div>
        )}

        {showCards && (
          <div className="fixture-events-row fixture-events-row--cards">
            <div className="fixture-events-side fixture-events-side--home">
              {homeCards.length > 0 && (
                <CardList cards={homeCards} side="home" teamLabel={homeLabel} />
              )}
            </div>
            <span className="fixture-events-gap" aria-hidden="true" />
            <div className="fixture-events-side fixture-events-side--away">
              {awayCards.length > 0 && (
                <CardList cards={awayCards} side="away" teamLabel={awayLabel} />
              )}
            </div>
          </div>
        )}
      </div>

      {isFinal && (
        <p className="fixture-final-banner" aria-hidden="true">
          The Final
        </p>
      )}

      <div className="fixture-venue">
        {fixture.venue}, {fixture.city}
      </div>
    </article>
  );
}

FixtureCard.propTypes = {
  fixture: fixtureShape.isRequired,
  homeTeam: teamShape,
  awayTeam: teamShape,
  showGroup: PropTypes.bool,
  showDate: PropTypes.bool,
  stackedLayout: PropTypes.bool,
};

export default FixtureCard;
