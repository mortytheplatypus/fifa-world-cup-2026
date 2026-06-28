import { useState } from "react";
import PropTypes from "prop-types";
import { useTimezone } from "../context/TimezoneContext";
import {
  BRACKET_TREE,
  KNOCKOUT_ROUND_LABELS,
  KNOCKOUT_ROUND_VIEWS,
  getKnockoutMatchIdsForView,
  getKnockoutMatchTag,
  formatKnockoutMatchDate,
  hasKnockoutKickoffTime,
  resolveKnockoutMatch,
} from "../utils/knockout";
import { formatFixtureTime, parseFixtureInstant } from "../utils/timezone";
import { getTeamDisplayName } from "../utils/data";
import { useMediaQuery } from "../hooks/useMediaQuery";
import KnockoutMatchLabel from "./KnockoutMatchLabel";
import KnockoutTeamSlot from "./KnockoutTeamSlot";

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
  }),
);

function KnockoutMatchCard({
  matchId,
  standingsByGroup,
  knockoutResults,
  compact,
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

  return (
    <div
      className={`knockout-match knockout-match--${match.round}${
        compact ? " knockout-match--compact" : ""
      }`}
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
        <KnockoutTeamSlot slot={match.resolvedA} />
        <span className="knockout-match-vs">vs</span>
        <KnockoutTeamSlot slot={match.resolvedB} />
      </div>
    </div>
  );
}

KnockoutMatchCard.propTypes = {
  matchId: PropTypes.string.isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  compact: PropTypes.bool,
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
});

function KnockoutListTeam({ slot, side }) {
  const isHome = side === "home";

  if (slot.type === "team" && slot.team) {
    const name = getTeamDisplayName(slot.team.name);
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
        className={`knockout-list-row-team knockout-list-row-team--${side}`}
      >
        {isHome ? (
          <>
            <span className="knockout-list-row-team-name">{name}</span>
            {slot.code && (
              <span className="knockout-list-row-team-code">{slot.code}</span>
            )}
            {flag}
          </>
        ) : (
          <>
            {flag}
            <span className="knockout-list-row-team-name">{name}</span>
            {slot.code && (
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
};

function KnockoutListRow({ matchId, standingsByGroup, knockoutResults }) {
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

  return (
    <div className={`knockout-list-row knockout-list-row--${match.round}`}>
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

      <div className="knockout-list-row-teams">
        <KnockoutListTeam slot={match.resolvedA} side="home" />
        {hasScore ? (
          <span className="knockout-list-row-score">
            {result.homeScore}–{result.awayScore}
          </span>
        ) : (
          <span className="knockout-list-row-vs">vs</span>
        )}
        <KnockoutListTeam slot={match.resolvedB} side="away" />
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
}) {
  if (startRound === "qf" || startRound === "sf") return null;

  if (startRound === "r16") {
    return (
      <KnockoutMatchCard
        matchId={pair.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
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
          />
        </div>
        <div className="knockout-bracket-feeder">
          <KnockoutMatchCard
            matchId={pair.r32[1]}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            compact
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
}) {
  if (startRound === "sf") return null;

  if (startRound === "qf") {
    return (
      <KnockoutMatchCard
        matchId={quarter.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
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
          />
        </div>
        <div className="knockout-bracket-feeder">
          <BracketPair
            pair={quarter.pair2}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
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
  feedsCenter,
}) {
  const mirrored = side === "right";

  if (startRound === "sf") {
    const sfCard = (
      <KnockoutMatchCard
        matchId={half.sf}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        compact
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
          />
        </div>
        <div className="knockout-bracket-feeder">
          <BracketQuarter
            quarter={half.quarter2}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            startRound={startRound}
            mirrored={mirrored}
          />
        </div>
      </div>
      <BracketMergeConnector mirrored={mirrored} />
      <div className="knockout-bracket-half-target">
        <KnockoutMatchCard
          matchId={half.sf}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          compact
        />
      </div>
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
  feedsCenter: PropTypes.bool,
};

BracketHalf.defaultProps = {
  feedsCenter: false,
};

const BRACKET_SIDES = ["left", "right"];

const BRACKET_SIDE_LABELS = {
  left: "Left bracket",
  right: "Right bracket",
};

const HALF_BRACKET_ROUNDS = ["r32", "r16"];
const HALF_BRACKET_START_ROUNDS = [...HALF_BRACKET_ROUNDS, "qf"];

function BracketHalfTreeView({
  standingsByGroup,
  knockoutResults,
  bracketSide,
  startRound,
}) {
  const isMobile = useMediaQuery(KNOCKOUT_MOBILE_MEDIA_QUERY);
  const half = BRACKET_TREE[bracketSide];
  const layoutSide = isMobile ? "left" : bracketSide;
  const isRight = !isMobile && bracketSide === "right";

  return (
    <div
      className={`knockout-bracket knockout-bracket--half${
        isRight ? " knockout-bracket--half-right" : ""
      }`}
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
        />
      </div>
    </div>
  );
}

BracketHalfTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  bracketSide: PropTypes.oneOf(BRACKET_SIDES).isRequired,
  startRound: PropTypes.oneOf(HALF_BRACKET_START_ROUNDS).isRequired,
};

function BracketTreeView({ standingsByGroup, knockoutResults }) {
  const { left, right } = BRACKET_TREE;

  return (
    <div className="knockout-bracket knockout-bracket--from-qf knockout-bracket--semifinals-only">
      <div className="knockout-bracket-tree">
        <BracketHalf
          half={left}
          side="left"
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          startRound="qf"
        />

        <BracketHalf
          half={right}
          side="right"
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          startRound="qf"
        />
      </div>
    </div>
  );
}

BracketTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
};

const KNOCKOUT_VIEW_MODES = ["tree", "list"];

const KNOCKOUT_VIEW_MODE_LABELS = {
  tree: "Tree",
  list: "List",
};

function BracketListView({ standingsByGroup, knockoutResults, viewRound }) {
  const matchIds = getKnockoutMatchIdsForView(viewRound);

  return (
    <div className="knockout-list">
      {matchIds.map((matchId) => (
        <KnockoutListRow
          key={matchId}
          matchId={matchId}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
        />
      ))}
    </div>
  );
}

BracketListView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  viewRound: PropTypes.oneOf(KNOCKOUT_ROUND_VIEWS).isRequired,
};

function renderBracketContent({
  isTreeView,
  showHalfBracket,
  standingsByGroup,
  knockoutResults,
  bracketSide,
  halfBracketStartRound,
  viewRound,
}) {
  if (!isTreeView) {
    return (
      <BracketListView
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        viewRound={viewRound}
      />
    );
  }

  if (showHalfBracket) {
    return (
      <BracketHalfTreeView
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
        bracketSide={bracketSide}
        startRound={halfBracketStartRound}
      />
    );
  }

  return (
    <BracketTreeView
      standingsByGroup={standingsByGroup}
      knockoutResults={knockoutResults}
    />
  );
}

function KnockoutBracket({
  standingsByGroup,
  knockoutResults,
  viewRound,
  onViewRoundChange,
}) {
  const [bracketSide, setBracketSide] = useState("left");
  const [viewMode, setViewMode] = useState("tree");
  const isMobile = useMediaQuery(KNOCKOUT_MOBILE_MEDIA_QUERY);

  const isTreeView = viewMode === "tree";
  const showHalfBracket =
    isTreeView &&
    (HALF_BRACKET_ROUNDS.includes(viewRound) ||
      (isMobile && viewRound === "finals"));
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
            {KNOCKOUT_VIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                className={`knockout-bracket-tab${
                  viewMode === mode ? " active" : ""
                }`}
                aria-selected={viewMode === mode}
                title={KNOCKOUT_VIEW_MODE_LABELS[mode]}
                onClick={() => setViewMode(mode)}
              >
                {KNOCKOUT_VIEW_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {showHalfBracket && (
          <div
            className="knockout-bracket-side-nav"
            role="tablist"
            aria-label="Bracket side"
          >
            {BRACKET_SIDES.map((side) => (
              <button
                key={side}
                type="button"
                role="tab"
                id={`knockout-side-tab-${side}`}
                className={`knockout-bracket-side-tab${
                  bracketSide === side ? " active" : ""
                }`}
                aria-selected={bracketSide === side}
                aria-controls={`knockout-side-panel-${side}`}
                onClick={() => setBracketSide(side)}
              >
                {BRACKET_SIDE_LABELS[side]}
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
            ? `knockout-side-panel-${bracketSide}`
            : `knockout-panel-${viewRound}`
        }
        aria-labelledby={
          showHalfBracket
            ? `knockout-side-tab-${bracketSide}`
            : `knockout-tab-${viewRound}`
        }
      >
        {renderBracketContent({
          isTreeView,
          showHalfBracket,
          standingsByGroup,
          knockoutResults,
          bracketSide,
          halfBracketStartRound,
          viewRound,
        })}
      </div>
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
