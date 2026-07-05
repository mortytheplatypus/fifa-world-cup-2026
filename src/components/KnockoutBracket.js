import { useState } from "react";
import PropTypes from "prop-types";
import { useTimezone } from "../context/TimezoneContext";
import {
  BRACKET_TREE,
  BRACKET_PATHS,
  BRACKET_PATH_LABELS,
  KNOCKOUT_ROUND_LABELS,
  KNOCKOUT_ROUND_VIEWS,
  getKnockoutMatchIdsForView,
  sortKnockoutMatchIdsBySchedule,
  KNOCKOUT_FINALS_LIST_SECTIONS,
  getKnockoutMatchTag,
  formatKnockoutMatchDate,
  formatKnockoutMatchTag,
  getKnockoutSideOutcome,
  hasKnockoutKickoffTime,
  isKnockoutPenaltyDecided,
  resolveKnockoutMatch,
  shouldShowKnockoutSeedCode,
} from "../utils/knockout";
import { formatFixtureTime, parseFixtureInstant } from "../utils/timezone";
import { getTeamDisplayName } from "../utils/data";
import { useMediaQuery } from "../hooks/useMediaQuery";
import KnockoutMatchDetailModal from "./KnockoutMatchDetailModal";
import KnockoutMatchLabel from "./KnockoutMatchLabel";
import { KnockoutScoreLine, KnockoutSplitTeamScore } from "./KnockoutScore";
import KnockoutTeamSlot from "./KnockoutTeamSlot";
import { getKnockoutScoreParts } from "../utils/knockoutPenalties";

function shouldIgnoreMatchClick(event) {
  return (
    event.target instanceof Element &&
    event.target.closest(".qualification-info, button, a")
  );
}

function handleMatchOpen(event, matchId, onMatchClick) {
  if (shouldIgnoreMatchClick(event) || !onMatchClick) {
    return;
  }

  onMatchClick(matchId);
}

const KNOCKOUT_MOBILE_MEDIA_QUERY = "(max-width: 720px)";

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
    penalties: PropTypes.shape({
      home: PropTypes.number,
      away: PropTypes.number,
    }),
  }),
);

function KnockoutMatchCard({
  matchId,
  standingsByGroup,
  knockoutResults,
  compact,
  onMatchClick,
}) {
  const { timeZone } = useTimezone();
  const isMobile = useMediaQuery(KNOCKOUT_MOBILE_MEDIA_QUERY);
  const match = resolveKnockoutMatch(matchId, standingsByGroup, {
    knockoutResults,
  });
  if (!match) return null;

  const tag = getKnockoutMatchTag(match.id);
  const schedule = {
    date: match.date,
    time: match.time,
    city: match.city,
  };
  const dateLabel = formatKnockoutMatchDate(schedule, timeZone);
  const timeLabel = hasKnockoutKickoffTime(schedule)
    ? formatFixtureTime(schedule, timeZone)
    : null;
  const dateTime = hasKnockoutKickoffTime(schedule)
    ? parseFixtureInstant(schedule).toISOString()
    : match.date;
  const result = knockoutResults[matchId];
  const homeOutcome = getKnockoutSideOutcome(result, "A");
  const awayOutcome = getKnockoutSideOutcome(result, "B");
  const penaltyDecided = isKnockoutPenaltyDecided(result);

  return (
    <div
      className={`knockout-match knockout-match--${match.round}${
        compact ? " knockout-match--compact" : ""
      } knockout-match--clickable${
        penaltyDecided ? " knockout-match--penalties" : ""
      }`}
      role="button"
      tabIndex={0}
      onClick={(event) => handleMatchOpen(event, match.id, onMatchClick)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMatchClick?.(match.id);
        }
      }}
      aria-label={`View details for ${tag ? formatKnockoutMatchTag(tag, match.id) : match.id}`}
    >
      <div className="knockout-match-header">
        <div className="knockout-match-meta">
          {dateLabel && (
            <time className="knockout-match-date" dateTime={dateTime}>
              <span className="knockout-match-date-label">{dateLabel}</span>
              {timeLabel && (
                <span className="knockout-match-time">{timeLabel}</span>
              )}
            </time>
          )}
        </div>
        {tag && (
          <KnockoutMatchLabel
            tag={tag}
            matchId={match.id}
            variant={isMobile ? "compact" : "split"}
            className="fixture-knockout-label knockout-bracket-label"
          />
        )}
      </div>
      <div className="knockout-match-teams">
        <KnockoutTeamSlot
          slot={match.resolvedA}
          outcome={homeOutcome}
          showSeedCode={shouldShowKnockoutSeedCode(match.round)}
          showThirdPlaceInfo={shouldShowKnockoutSeedCode(match.round)}
        />
        <span className="knockout-match-vs">vs</span>
        <KnockoutTeamSlot
          slot={match.resolvedB}
          outcome={awayOutcome}
          showSeedCode={shouldShowKnockoutSeedCode(match.round)}
          showThirdPlaceInfo={shouldShowKnockoutSeedCode(match.round)}
        />
      </div>
    </div>
  );
}

KnockoutMatchCard.propTypes = {
  matchId: PropTypes.string.isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  compact: PropTypes.bool,
  onMatchClick: PropTypes.func,
};

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
  penaltyScore: PropTypes.number,
});

function KnockoutListTeam({
  slot,
  side,
  outcome = null,
  showSeedCode = false,
  scoreParts = null,
}) {
  const isHome = side === "home";
  const isMobile = useMediaQuery(KNOCKOUT_MOBILE_MEDIA_QUERY);
  const outcomeClass =
    outcome === "eliminated"
      ? " knockout-list-row-team--eliminated"
      : outcome === "winner"
        ? " knockout-list-row-team--winner"
        : "";

  if (slot.type === "team" && slot.team) {
    const name = isMobile
      ? slot.team.id
      : getTeamDisplayName(slot.team.name);
    const ariaLabel =
      outcome === "eliminated" ? `${name}, eliminated` : name;
    const flag = (
      <img
        className="knockout-list-row-flag"
        src={`https://flagcdn.com/w20/${slot.team.flagCode}.png`}
        alt=""
        width={18}
        height={13}
      />
    );

    return (
      <span
        className={`knockout-list-row-team knockout-list-row-team--${side}${outcomeClass}`}
        aria-label={ariaLabel}
      >
        {isHome ? (
          <>
            <span className="knockout-list-row-team-name">{name}</span>
            {!isMobile && showSeedCode && slot.code && (
              <span className="knockout-list-row-team-code">{slot.code}</span>
            )}
            {flag}
            {scoreParts?.penalty != null && (
              <KnockoutSplitTeamScore
                regulation={scoreParts.regulation}
                penalty={scoreParts.penalty}
                side="home"
                outcome={outcome}
              />
            )}
          </>
        ) : (
          <>
            {scoreParts?.penalty != null && (
              <KnockoutSplitTeamScore
                regulation={scoreParts.regulation}
                penalty={scoreParts.penalty}
                side="away"
                outcome={outcome}
              />
            )}
            {flag}
            <span className="knockout-list-row-team-name">{name}</span>
            {!isMobile && showSeedCode && slot.code && (
              <span className="knockout-list-row-team-code">{slot.code}</span>
            )}
          </>
        )}
      </span>
    );
  }

  const label = slot.label ?? "TBD";

  return (
    <span
      className={`knockout-list-row-team knockout-list-row-team--${side} knockout-list-row-team--placeholder`}
    >
      <span className="knockout-list-row-team-name">{label}</span>
    </span>
  );
}

KnockoutListTeam.propTypes = {
  slot: resolvedSlotShape.isRequired,
  side: PropTypes.oneOf(["home", "away"]).isRequired,
  outcome: PropTypes.oneOf(["winner", "eliminated"]),
  showSeedCode: PropTypes.bool,
  scoreParts: PropTypes.shape({
    regulation: PropTypes.number,
    penalty: PropTypes.number,
  }),
};

function KnockoutListRow({
  matchId,
  standingsByGroup,
  knockoutResults,
  onMatchClick,
}) {
  const { timeZone } = useTimezone();
  const match = resolveKnockoutMatch(matchId, standingsByGroup, {
    knockoutResults,
  });
  if (!match) return null;

  const tag = getKnockoutMatchTag(match.id);
  const schedule = {
    date: match.date,
    time: match.time,
    city: match.city,
  };
  const dateLabel = formatKnockoutMatchDate(schedule, timeZone);
  const timeLabel = hasKnockoutKickoffTime(schedule)
    ? formatFixtureTime(schedule, timeZone)
    : null;
  const dateTime = hasKnockoutKickoffTime(schedule)
    ? parseFixtureInstant(schedule).toISOString()
    : match.date;
  const result = knockoutResults[matchId];
  const hasScore =
    result?.homeScore != null && result?.awayScore != null;
  const homeOutcome = getKnockoutSideOutcome(result, "A");
  const awayOutcome = getKnockoutSideOutcome(result, "B");
  const penaltyDisplay = isKnockoutPenaltyDecided(result);
  const homeScoreParts = penaltyDisplay ? getKnockoutScoreParts(result, "home") : null;
  const awayScoreParts = penaltyDisplay ? getKnockoutScoreParts(result, "away") : null;

  return (
    <div
      className={`knockout-list-row knockout-list-row--${match.round} knockout-list-row--clickable${
        hasScore ? " knockout-list-row--completed" : ""
      }`}
      role="button"
      tabIndex={0}
      onClick={(event) => handleMatchOpen(event, match.id, onMatchClick)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMatchClick?.(match.id);
        }
      }}
      aria-label={`View details for ${tag ? formatKnockoutMatchTag(tag, match.id) : match.id}`}
    >
      {dateLabel && (
        <time className="knockout-list-row-date" dateTime={dateTime}>
          {dateLabel}
          {timeLabel && (
            <>
              {" · "}
              {timeLabel}
            </>
          )}
        </time>
      )}

      <div
        className={`knockout-list-row-teams${
          penaltyDisplay ? " knockout-list-row-teams--penalties" : ""
        }`}
      >
        <KnockoutListTeam
          slot={match.resolvedA}
          side="home"
          outcome={homeOutcome}
          showSeedCode={shouldShowKnockoutSeedCode(match.round)}
          scoreParts={homeScoreParts}
        />
        {hasScore ? (
          penaltyDisplay ? (
            <span
              className="knockout-list-row-score-separator"
              aria-hidden="true"
            >
              {" - "}
            </span>
          ) : (
            <KnockoutScoreLine
              result={result}
              className="knockout-list-row-score"
            />
          )
        ) : (
          <span className="knockout-list-row-vs">vs</span>
        )}
        <KnockoutListTeam
          slot={match.resolvedB}
          side="away"
          outcome={awayOutcome}
          showSeedCode={shouldShowKnockoutSeedCode(match.round)}
          scoreParts={awayScoreParts}
        />
      </div>

      {tag && (
        <KnockoutMatchLabel
          tag={tag}
          matchId={match.id}
          variant="compact"
          className="knockout-list-row-label"
        />
      )}
    </div>
  );
}

KnockoutListRow.propTypes = {
  matchId: PropTypes.string.isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  onMatchClick: PropTypes.func,
};

function BracketMergeConnector({ mirrored = false }) {
  return (
    <div
      className={`knockout-bracket-merge${mirrored ? " knockout-bracket-merge--mirrored" : ""}`}
      aria-hidden="true"
    >
      <svg
        className="knockout-bracket-merge-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          className="knockout-bracket-merge-path"
          d={
            mirrored ? "M 50 25 V 75 M 50 50 H 0" : "M 50 25 V 75 M 50 50 H 100"
          }
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

BracketMergeConnector.propTypes = {
  mirrored: PropTypes.bool,
};

BracketMergeConnector.defaultProps = {
  mirrored: false,
};

function BracketPair({
  pair,
  standingsByGroup,
  knockoutResults,
  startRound,
  mirrored,
  onMatchClick,
}) {
  if (startRound === "qf" || startRound === "sf") return null;

  if (startRound === "r16") {
    return (
      <KnockoutMatchCard
        matchId={pair.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        onMatchClick={onMatchClick}
      />
    );
  }

  return (
    <div
      className={`knockout-bracket-pair${mirrored ? " knockout-bracket-pair--mirrored" : ""}`}
    >
      <div className="knockout-bracket-pair-feeders">
        <div className="knockout-bracket-feeder">
          <KnockoutMatchCard
            matchId={pair.r32[0]}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            compact
            onMatchClick={onMatchClick}
          />
        </div>
        <div className="knockout-bracket-feeder">
          <KnockoutMatchCard
            matchId={pair.r32[1]}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            compact
            onMatchClick={onMatchClick}
          />
        </div>
      </div>
      <BracketMergeConnector mirrored={mirrored} />
      <div className="knockout-bracket-pair-target">
        <KnockoutMatchCard
          matchId={pair.r16}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          compact
          onMatchClick={onMatchClick}
        />
      </div>
    </div>
  );
}

BracketPair.propTypes = {
  pair: PropTypes.shape({
    r16: PropTypes.string.isRequired,
    r32: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  startRound: PropTypes.oneOf(["r32", "r16", "qf", "sf"]).isRequired,
  mirrored: PropTypes.bool,
  onMatchClick: PropTypes.func,
};

BracketPair.defaultProps = {
  mirrored: false,
};

function BracketQuarter({
  quarter,
  standingsByGroup,
  knockoutResults,
  startRound,
  mirrored,
  onMatchClick,
}) {
  if (startRound === "sf") return null;

  if (startRound === "qf") {
    return (
      <KnockoutMatchCard
        matchId={quarter.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        onMatchClick={onMatchClick}
      />
    );
  }

  return (
    <div
      className={`knockout-bracket-quarter${mirrored ? " knockout-bracket-quarter--mirrored" : ""}`}
    >
      <div className="knockout-bracket-quarter-feeders">
        <div className="knockout-bracket-feeder">
          <BracketPair
            pair={quarter.pair1}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
            onMatchClick={onMatchClick}
          />
        </div>
        <div className="knockout-bracket-feeder">
          <BracketPair
            pair={quarter.pair2}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
            onMatchClick={onMatchClick}
          />
        </div>
      </div>
      <BracketMergeConnector mirrored={mirrored} />
      <div className="knockout-bracket-quarter-target">
        <KnockoutMatchCard
          matchId={quarter.r16}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          compact
          onMatchClick={onMatchClick}
        />
      </div>
    </div>
  );
}

BracketQuarter.propTypes = {
  quarter: PropTypes.shape({
    r16: PropTypes.string.isRequired,
    pair1: PropTypes.object.isRequired,
    pair2: PropTypes.object.isRequired,
  }).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  startRound: PropTypes.oneOf(["r32", "r16", "qf", "sf"]).isRequired,
  mirrored: PropTypes.bool,
  onMatchClick: PropTypes.func,
};

BracketQuarter.defaultProps = {
  mirrored: false,
};

function BracketHalf({
  half,
  side,
  standingsByGroup,
  knockoutResults,
  startRound,
  includeSf,
  feedsCenter,
  onMatchClick,
}) {
  const mirrored = side === "right";
  const showSf =
    includeSf ?? (startRound === "qf" || startRound === "sf");

  if (startRound === "sf") {
    const sfCard = (
      <KnockoutMatchCard
        matchId={half.sf}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        compact
        onMatchClick={onMatchClick}
      />
    );

    if (!feedsCenter) {
      return (
        <div className={`knockout-bracket-half knockout-bracket-half--${side}`}>
          {sfCard}
        </div>
      );
    }

    return (
      <div
        className={`knockout-bracket-half knockout-bracket-half--${side}${
          mirrored ? " knockout-bracket-half--mirrored" : ""
        }`}
      >
        <div className="knockout-bracket-half-target">{sfCard}</div>
      </div>
    );
  }

  return (
    <div
      className={`knockout-bracket-half knockout-bracket-half--${side}${
        mirrored ? " knockout-bracket-half--mirrored" : ""
      }`}
    >
      <div className="knockout-bracket-half-feeders">
        <div className="knockout-bracket-feeder">
          <BracketQuarter
            quarter={half.quarter1}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
            onMatchClick={onMatchClick}
          />
        </div>
        <div className="knockout-bracket-feeder">
          <BracketQuarter
            quarter={half.quarter2}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
            onMatchClick={onMatchClick}
          />
        </div>
      </div>
      {showSf && (
        <>
          <BracketMergeConnector mirrored={mirrored} />
          <div className="knockout-bracket-half-target">
            <KnockoutMatchCard
              matchId={half.sf}
              standingsByGroup={standingsByGroup}
              knockoutResults={knockoutResults}
              compact
              onMatchClick={onMatchClick}
            />
          </div>
        </>
      )}
    </div>
  );
}

BracketHalf.propTypes = {
  half: PropTypes.shape({
    quarter1: PropTypes.object.isRequired,
    quarter2: PropTypes.object.isRequired,
    sf: PropTypes.string.isRequired,
  }).isRequired,
  side: PropTypes.oneOf(["left", "right"]).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  startRound: PropTypes.oneOf(["r32", "r16", "qf", "sf"]).isRequired,
  includeSf: PropTypes.bool,
  feedsCenter: PropTypes.bool,
  onMatchClick: PropTypes.func,
};

BracketHalf.defaultProps = {
  feedsCenter: false,
};

const HALF_BRACKET_ROUNDS = ["r32", "r16"];
const HALF_BRACKET_START_ROUNDS = [...HALF_BRACKET_ROUNDS, "qf"];

function BracketHalfTreeView({
  standingsByGroup,
  knockoutResults,
  bracketPath,
  startRound,
  onMatchClick,
}) {
  const isMobile = useMediaQuery(KNOCKOUT_MOBILE_MEDIA_QUERY);
  const half = BRACKET_TREE[bracketPath];
  const layoutSide =
    isMobile ? "left" : bracketPath === "right" ? "right" : "left";
  const isRight = !isMobile && bracketPath === "right";
  const includeSf = startRound === "r16" || startRound === "qf";

  return (
    <div
      className={`knockout-bracket knockout-bracket--half${
        startRound === "qf" ? " knockout-bracket--half-from-qf" : ""
      }${isRight ? " knockout-bracket--half-right" : ""}`}
    >
      <div
        className={`knockout-bracket-tree knockout-bracket-tree--half${
          isRight ? " knockout-bracket-tree--half-right" : ""
        }`}
      >
        <BracketHalf
          half={half}
          side={layoutSide}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          startRound={startRound}
          includeSf={includeSf}
          onMatchClick={onMatchClick}
        />
      </div>
    </div>
  );
}

BracketHalfTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  bracketPath: PropTypes.oneOf(BRACKET_PATHS).isRequired,
  startRound: PropTypes.oneOf(HALF_BRACKET_START_ROUNDS).isRequired,
  onMatchClick: PropTypes.func,
};

const KNOCKOUT_VIEW_MODES = ["tree", "list"];

const KNOCKOUT_VIEW_MODE_STORAGE_KEY = "knockout-view-mode";

const KNOCKOUT_VIEW_MODE_LABELS = {
  tree: "Tree",
  list: "List",
};

function readStoredKnockoutViewMode() {
  try {
    const value = localStorage.getItem(KNOCKOUT_VIEW_MODE_STORAGE_KEY);
    return KNOCKOUT_VIEW_MODES.includes(value) ? value : "tree";
  } catch {
    return "tree";
  }
}

function writeStoredKnockoutViewMode(mode) {
  try {
    localStorage.setItem(KNOCKOUT_VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage failures
  }
}

function TreeViewIcon() {
  return (
    <svg
      className="knockout-view-mode-icon"
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
      <rect x="3" y="4" width="6" height="4" rx="1" />
      <rect x="15" y="4" width="6" height="4" rx="1" />
      <rect x="9" y="16" width="6" height="4" rx="1" />
      <path d="M6 8v2.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg
      className="knockout-view-mode-icon"
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
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

const KNOCKOUT_VIEW_MODE_ICONS = {
  tree: TreeViewIcon,
  list: ListViewIcon,
};

function KnockoutListTable({
  matchIds,
  standingsByGroup,
  knockoutResults,
  section,
  onMatchClick,
}) {
  const rows = matchIds.map((matchId) => (
    <KnockoutListRow
      key={matchId}
      matchId={matchId}
      standingsByGroup={standingsByGroup}
      knockoutResults={knockoutResults}
      onMatchClick={onMatchClick}
    />
  ));

  if (section) {
    const { round, label } = section;

    return (
      <section
        className={`knockout-list knockout-list-section knockout-list-section--${round}`}
        aria-labelledby={`knockout-list-section-${round}`}
      >
        <header
          id={`knockout-list-section-${round}`}
          className="knockout-list-section-header"
          title={KNOCKOUT_ROUND_LABELS[round]}
        >
          {label}
        </header>
        {rows}
      </section>
    );
  }

  return <div className="knockout-list">{rows}</div>;
}

KnockoutListTable.propTypes = {
  matchIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  section: PropTypes.shape({
    round: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
  onMatchClick: PropTypes.func,
};

function BracketListView({
  standingsByGroup,
  knockoutResults,
  viewRound,
  onMatchClick,
}) {
  if (viewRound === "finals") {
    return (
      <div className="knockout-list-grouped">
        {KNOCKOUT_FINALS_LIST_SECTIONS.map(({ round, label, matchIds }) => (
          <KnockoutListTable
            key={round}
            matchIds={sortKnockoutMatchIdsBySchedule(matchIds, knockoutResults)}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            section={{ round, label }}
            onMatchClick={onMatchClick}
          />
        ))}
      </div>
    );
  }

  const matchIds = sortKnockoutMatchIdsBySchedule(
    getKnockoutMatchIdsForView(viewRound),
    knockoutResults,
  );

  return (
    <KnockoutListTable
      matchIds={matchIds}
      standingsByGroup={standingsByGroup}
      knockoutResults={knockoutResults}
      onMatchClick={onMatchClick}
    />
  );
}

BracketListView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  viewRound: PropTypes.oneOf(KNOCKOUT_ROUND_VIEWS).isRequired,
  onMatchClick: PropTypes.func,
};

function renderBracketContent({
  isTreeView,
  showHalfBracket,
  standingsByGroup,
  knockoutResults,
  bracketPath,
  halfBracketStartRound,
  viewRound,
  onMatchClick,
}) {
  if (!isTreeView) {
    return (
      <BracketListView
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        viewRound={viewRound}
        onMatchClick={onMatchClick}
      />
    );
  }

  return (
    <BracketHalfTreeView
      standingsByGroup={standingsByGroup}
      knockoutResults={knockoutResults}
      bracketPath={bracketPath}
      startRound={halfBracketStartRound}
      onMatchClick={onMatchClick}
    />
  );
}

function KnockoutBracket({
  standingsByGroup,
  knockoutResults,
  viewRound,
  onViewRoundChange,
}) {
  const [bracketPath, setBracketPath] = useState("left");
  const [viewMode, setViewMode] = useState(readStoredKnockoutViewMode);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const isTreeView = viewMode === "tree";
  const showHalfBracket = isTreeView;
  const halfBracketStartRound = viewRound === "finals" ? "qf" : viewRound;

  return (
    <div className="knockout-bracket-container">
      <div className="knockout-bracket-nav">
        <div className="knockout-bracket-nav-row">
          <div
            className="knockout-bracket-tabs knockout-bracket-tabs--rounds"
            role="tablist"
            aria-label="Knockout round"
          >
            {KNOCKOUT_ROUND_VIEWS.map((round) => (
              <button
                key={round}
                type="button"
                role="tab"
                id={`knockout-tab-${round}`}
                className={`knockout-bracket-tab${viewRound === round ? " active" : ""}`}
                aria-selected={viewRound === round}
                aria-controls={`knockout-panel-${round}`}
                title={KNOCKOUT_ROUND_LABELS[round]}
                onClick={() => onViewRoundChange(round)}
              >
                {KNOCKOUT_ROUND_LABELS[round]}
              </button>
            ))}
          </div>

          <div
            className="knockout-bracket-tabs knockout-bracket-tabs--view-mode"
            role="tablist"
            aria-label="View mode"
          >
            {KNOCKOUT_VIEW_MODES.map((mode) => {
              const Icon = KNOCKOUT_VIEW_MODE_ICONS[mode];

              return (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  className={`knockout-bracket-tab knockout-bracket-tab--icon${
                    viewMode === mode ? " active" : ""
                  }`}
                  aria-selected={viewMode === mode}
                  aria-label={KNOCKOUT_VIEW_MODE_LABELS[mode]}
                  title={KNOCKOUT_VIEW_MODE_LABELS[mode]}
                  onClick={() => {
                    setViewMode(mode);
                    writeStoredKnockoutViewMode(mode);
                  }}
                >
                  <Icon />
                </button>
              );
            })}
          </div>
        </div>

        {showHalfBracket && (
          <div
            className="knockout-bracket-side-nav"
            role="tablist"
            aria-label="Bracket path"
          >
            {BRACKET_PATHS.map((path) => (
              <button
                key={path}
                type="button"
                role="tab"
                id={`knockout-path-tab-${path}`}
                className={`knockout-bracket-side-tab${
                  bracketPath === path ? " active" : ""
                }`}
                aria-selected={bracketPath === path}
                aria-controls={`knockout-path-panel-${path}`}
                onClick={() => setBracketPath(path)}
              >
                {BRACKET_PATH_LABELS[path]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`knockout-bracket-scroll${
          isTreeView ? "" : " knockout-bracket-scroll--list"
        }`}
        role="tabpanel"
        id={
          showHalfBracket
            ? `knockout-path-panel-${bracketPath}`
            : `knockout-panel-${viewRound}`
        }
        aria-labelledby={
          showHalfBracket
            ? `knockout-path-tab-${bracketPath}`
            : `knockout-tab-${viewRound}`
        }
      >
        {renderBracketContent({
          isTreeView,
          showHalfBracket,
          standingsByGroup,
          knockoutResults,
          bracketPath,
          halfBracketStartRound,
          viewRound,
          onMatchClick: setSelectedMatchId,
        })}
      </div>

      {selectedMatchId && (
        <KnockoutMatchDetailModal
          matchId={selectedMatchId}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </div>
  );
}

KnockoutBracket.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  viewRound: PropTypes.oneOf(KNOCKOUT_ROUND_VIEWS).isRequired,
  onViewRoundChange: PropTypes.func.isRequired,
};

export default KnockoutBracket;
