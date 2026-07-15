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
  const status = getFixtureStatus(fixture, now);
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
          {showScorers && homeGoals.length > 0 && (
            <ul
              className="fixture-team-scorers fixture-team-scorers--home"
              aria-label={`${homeLabel} goals`}
            >
              {homeGoals.map((goal) => (
                <li key={`${goal.scorer}-${goal.minute}`}>
                  <span className="fixture-goal-emoji" aria-hidden="true">
                    {GOAL_EMOJI}
                  </span>{" "}
                  {goal.minute}&apos; {goal.scorer}
                </li>
              ))}
            </ul>
          )}
          {showCards && homeCards.length > 0 && (
            <ul
              className="fixture-team-cards fixture-team-cards--home"
              aria-label={`${homeLabel} cards`}
            >
              {homeCards.map((card, index) => {
                const { emoji, label } = getCardDisplay(card);
                const player = getCardPlayerName(card);
                return (
                  <li key={`${card.type}-${player ?? index}-${index}`}>
                    <span className="fixture-card-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                    {card.minute != null && <> {card.minute}&apos;</>}
                    {player ? <> {player}</> : <> {label}</>}
                  </li>
                );
              })}
            </ul>
          )}
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
          {showScorers && awayGoals.length > 0 && (
            <ul
              className="fixture-team-scorers fixture-team-scorers--away"
              aria-label={`${awayLabel} goals`}
            >
              {awayGoals.map((goal) => (
                <li key={`${goal.scorer}-${goal.minute}`}>
                  {goal.scorer} {goal.minute}&apos;{" "}
                  <span className="fixture-goal-emoji" aria-hidden="true">
                    {GOAL_EMOJI}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {showCards && awayCards.length > 0 && (
            <ul
              className="fixture-team-cards fixture-team-cards--away"
              aria-label={`${awayLabel} cards`}
            >
              {awayCards.map((card, index) => {
                const { emoji, label } = getCardDisplay(card);
                const player = getCardPlayerName(card);
                return (
                  <li key={`${card.type}-${player ?? index}-${index}`}>
                    {player ?? label}
                    {card.minute != null && <> {card.minute}&apos;</>}{" "}
                    <span className="fixture-card-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
