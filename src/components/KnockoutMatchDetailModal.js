import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTimezone } from "../context/TimezoneContext";
import { getTeamDisplayName, getTeamPath } from "../utils/data";
import {
  formatKnockoutMatchNumber,
  getKnockoutMatchTag,
  hasKnockoutKickoffTime,
  KNOCKOUT_ROUND_LABELS,
  parseKnockoutMatchTag,
  resolveKnockoutMatch,
  shouldShowKnockoutSeedCode,
} from "../utils/knockout";
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

const GOAL_EMOJI = "⚽";

const standingsByGroupShape = PropTypes.objectOf(
  PropTypes.arrayOf(
    PropTypes.shape({
      team: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        flagCode: PropTypes.string,
      }),
    }),
  ),
);

const knockoutResultsShape = PropTypes.objectOf(
  PropTypes.shape({
    homeScore: PropTypes.number,
    awayScore: PropTypes.number,
    goals: PropTypes.array,
    cards: PropTypes.array,
  }),
);

const resolvedSlotShape = PropTypes.shape({
  type: PropTypes.oneOf(["team", "third", "placeholder"]).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    flagCode: PropTypes.string,
  }),
  label: PropTypes.string,
  code: PropTypes.string,
  score: PropTypes.number,
});

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function DetailTeamHeader({ slot, side, showSeedCode = false }) {
  if (slot.type === "team" && slot.team) {
    const team = slot.team;
    const name = getTeamDisplayName(team.name);

    return (
      <div
        className={`knockout-detail-team-header knockout-detail-team-header--${side}`}
      >
        <Link
          to={getTeamPath(team)}
          className="knockout-detail-team-label knockout-detail-team-label--link"
        >
          <img
            className="knockout-detail-team-flag"
            src={`https://flagcdn.com/w40/${team.flagCode}.png`}
            alt=""
            width={32}
            height={24}
          />
          <span className="knockout-detail-team-name">{name}</span>
          {showSeedCode && slot.code && (
            <span className="knockout-detail-team-code">{slot.code}</span>
          )}
        </Link>
      </div>
    );
  }

  const label = slot.label ?? "TBD";

  return (
    <div
      className={`knockout-detail-team-header knockout-detail-team-header--${side} knockout-detail-team-header--placeholder`}
    >
      <span className="knockout-detail-team-name">{label}</span>
    </div>
  );
}

DetailTeamHeader.propTypes = {
  slot: resolvedSlotShape.isRequired,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
  showSeedCode: PropTypes.bool,
};

function DetailTeamEvents({ goals, cards, side, teamName }) {
  if (goals.length === 0 && cards.length === 0) {
    return (
      <div
        className={`knockout-detail-team-events-col knockout-detail-team-events-col--${side}`}
        aria-hidden="true"
      />
    );
  }

  const isHome = side === "home";

  return (
    <div
      className={`knockout-detail-team-events-col knockout-detail-team-events-col--${side}`}
    >
      {goals.length > 0 && (
        <ul
          className="knockout-detail-team-events knockout-detail-team-events--goals"
          aria-label={`${teamName} goals`}
        >
          {goals.map((goal) => (
            <li key={`${goal.scorer}-${goal.minute}`}>
              {isHome ? (
                <>
                  <span className="knockout-detail-event-emoji" aria-hidden="true">
                    {GOAL_EMOJI}
                  </span>
                  <span className="knockout-detail-event-minute">{goal.minute}&apos;</span>
                  <span className="knockout-detail-event-player">{goal.scorer}</span>
                </>
              ) : (
                <>
                  <span className="knockout-detail-event-player">{goal.scorer}</span>
                  <span className="knockout-detail-event-minute">{goal.minute}&apos;</span>
                  <span className="knockout-detail-event-emoji" aria-hidden="true">
                    {GOAL_EMOJI}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {cards.length > 0 && (
        <ul
          className="knockout-detail-team-events knockout-detail-team-events--cards"
          aria-label={`${teamName} cards`}
        >
          {cards.map((card, index) => {
            const { emoji, label } = getCardDisplay(card);
            const player = getCardPlayerName(card);

            return (
              <li key={`${card.type}-${player ?? index}-${index}`}>
                {isHome ? (
                  <>
                    <span className="knockout-detail-event-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                    {card.minute != null && (
                      <span className="knockout-detail-event-minute">{card.minute}&apos;</span>
                    )}
                    <span className="knockout-detail-event-player">
                      {player ?? label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="knockout-detail-event-player">
                      {player ?? label}
                    </span>
                    {card.minute != null && (
                      <span className="knockout-detail-event-minute">{card.minute}&apos;</span>
                    )}
                    <span className="knockout-detail-event-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

DetailTeamEvents.propTypes = {
  goals: PropTypes.arrayOf(PropTypes.object).isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
  teamName: PropTypes.string,
};

function KnockoutMatchDetailModal({
  matchId,
  standingsByGroup,
  knockoutResults,
  onClose,
}) {
  const { timeZone } = useTimezone();
  const closeButtonRef = useRef(null);
  const match = resolveKnockoutMatch(matchId, standingsByGroup, {
    knockoutResults,
  });

  useEffect(() => {
    if (!match) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [match, onClose]);

  if (!match) {
    return null;
  }

  const tag = getKnockoutMatchTag(match.id);
  const parsedTag = parseKnockoutMatchTag(tag);
  const result = knockoutResults[matchId];
  const schedule = {
    date: match.date,
    time: match.time,
    city: match.city,
    venue: match.venue,
  };
  const goals = result?.goals ?? [];
  const cards = result?.cards ?? [];
  const { home: homeGoals, away: awayGoals } = getGoalsBySide(goals);
  const { home: homeCards, away: awayCards } = getCardsBySide(cards);
  const showMatchEvents = goals.length > 0 || cards.length > 0;
  const hasScore = result?.homeScore != null && result?.awayScore != null;
  const title = formatKnockoutMatchNumber(match.id);
  const roundLabel =
    parsedTag?.round ?? KNOCKOUT_ROUND_LABELS[match.round] ?? match.round;
  const dateTime = hasKnockoutKickoffTime(schedule)
    ? parseFixtureInstant(schedule).toISOString()
    : match.date;

  const showSeedCode = shouldShowKnockoutSeedCode(match.round);

  return createPortal(
    <div className="knockout-detail-overlay" onClick={onClose}>
      <div
        className={`knockout-detail-modal knockout-detail-modal--${match.round}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="knockout-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="knockout-detail-header">
          <div className="knockout-detail-heading">
            <h2 id="knockout-detail-title" className="knockout-detail-title">
              <span className="knockout-detail-round">{roundLabel}</span>
              <span className="knockout-detail-title-separator" aria-hidden="true">
                ·
              </span>
              <span>{title}</span>
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="knockout-detail-close"
            onClick={onClose}
            aria-label="Close match details"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="knockout-detail-body">
          {match.date && (
            <time className="knockout-detail-datetime" dateTime={dateTime}>
              {formatFixtureDate(schedule, timeZone)}
              {hasKnockoutKickoffTime(schedule) && (
                <>
                  {" · "}
                  {formatFixtureTime(schedule, timeZone)}
                </>
              )}
            </time>
          )}

          <div
            className={`knockout-detail-teams${
              showMatchEvents ? " knockout-detail-teams--has-events" : ""
            }`}
          >
            <div className="knockout-detail-team-row">
              <DetailTeamHeader
                slot={match.resolvedA}
                side="home"
                showSeedCode={showSeedCode}
              />
              {hasScore ? (
                <span className="knockout-detail-score">
                  {result.homeScore} – {result.awayScore}
                </span>
              ) : (
                <span className="knockout-detail-vs">vs</span>
              )}
              <DetailTeamHeader
                slot={match.resolvedB}
                side="away"
                showSeedCode={showSeedCode}
              />
            </div>

            {showMatchEvents && (
              <div className="knockout-detail-events-row">
                <DetailTeamEvents
                  goals={homeGoals}
                  cards={homeCards}
                  side="home"
                  teamName={match.resolvedA.team?.name}
                />
                <DetailTeamEvents
                  goals={awayGoals}
                  cards={awayCards}
                  side="away"
                  teamName={match.resolvedB.team?.name}
                />
              </div>
            )}
          </div>

          {match.venue && match.city && (
            <p className="knockout-detail-venue">
              {match.venue}, {match.city}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

KnockoutMatchDetailModal.propTypes = {
  matchId: PropTypes.string.isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default KnockoutMatchDetailModal;
