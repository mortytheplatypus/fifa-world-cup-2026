import PropTypes from "prop-types";
import { useTimezone } from "../context/TimezoneContext";
import { useNow } from "../hooks/useNow";
import { getTeamDisplayName } from "../utils/data";
import KnockoutMatchLabel from "./KnockoutMatchLabel";
import { fixtureShape, teamShape } from "../propTypes";
import { getFixtureStatus } from "../utils/fixtures";
import {
  getCardDisplay,
  getCardPlayerName,
  getCardsBySide,
  getGoalsBySide,
} from "../utils/results";
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

  return (
    <article
      className={`fixture-card fixture-card--${status}${
        showDate ? " fixture-card--show-date" : ""
      }${stackedLayout ? " fixture-card--stacked" : ""}`}
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
              {" · "}
            </>
          )}
          {formatFixtureTime(fixture, timeZone)}
        </time>
      </div>

      <div className="fixture-teams">
        <div className="fixture-team-side fixture-team-side--home">
          <div className="fixture-team-label">
            <img
              className="fixture-team-flag fixture-team-flag--home"
              src={`https://flagcdn.com/w40/${homeTeam.flagCode}.png`}
              alt=""
              width={32}
              height={24}
            />
            <span className="fixture-team-name fixture-team-name--home">
              {getTeamDisplayName(homeTeam.name)}
            </span>
          </div>
          {showScorers && homeGoals.length > 0 && (
            <ul
              className="fixture-team-scorers fixture-team-scorers--home"
              aria-label={`${homeTeam.name} goals`}
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
              aria-label={`${homeTeam.name} cards`}
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
          <span className="fixture-score">
            {fixture.homeScore} – {fixture.awayScore}
          </span>
        ) : (
          <span className="fixture-vs">vs</span>
        )}

        <div className="fixture-team-side fixture-team-side--away">
          <div className="fixture-team-label">
            <img
              className="fixture-team-flag fixture-team-flag--away"
              src={`https://flagcdn.com/w40/${awayTeam.flagCode}.png`}
              alt=""
              width={32}
              height={24}
            />
            <span className="fixture-team-name fixture-team-name--away">
              {getTeamDisplayName(awayTeam.name)}
            </span>
          </div>
          {showScorers && awayGoals.length > 0 && (
            <ul
              className="fixture-team-scorers fixture-team-scorers--away"
              aria-label={`${awayTeam.name} goals`}
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
              aria-label={`${awayTeam.name} cards`}
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
  stackedLayout: PropTypes.bool,
};

export default FixtureCard;
