import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTimezone } from "../context/TimezoneContext";
import {
  KNOCKOUT_ROUND_LABELS,
  KNOCKOUT_ROUND_VIEWS,
  getKnockoutBracketRoundsFrom,
  getKnockoutListSectionsFromView,
  getKnockoutMatchIdsForView,
  sortKnockoutMatchIdsBySchedule,
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
import {
  buildBracketConnectorPaths,
  getBracketGutterColumn,
  getBracketGridRow,
  getBracketMatchColumn,
  getBracketTotalRows,
  getMatchAnchor,
} from "../utils/bracketLayout";

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

function useBracketConnectorLines(containerRef, rounds, knockoutResults) {
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || rounds.length < 2) {
      setPaths([]);
      return undefined;
    }

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const nextPaths = [];

      for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
        const fromIds = rounds[roundIndex].matchIds;
        const toIds = rounds[roundIndex + 1].matchIds;

        for (let matchIndex = 0; matchIndex < toIds.length; matchIndex += 1) {
          const sourceAId = fromIds[matchIndex * 2];
          const sourceBId = fromIds[matchIndex * 2 + 1];
          const targetId = toIds[matchIndex];
          const sourceA = container.querySelector(
            `[data-bracket-match="${sourceAId}"]`,
          );
          const sourceB = container.querySelector(
            `[data-bracket-match="${sourceBId}"]`,
          );
          const target = container.querySelector(
            `[data-bracket-match="${targetId}"]`,
          );

          if (!sourceA || !sourceB || !target) {
            continue;
          }

          nextPaths.push(
            ...buildBracketConnectorPaths(
              getMatchAnchor(sourceA, "right", containerRect),
              getMatchAnchor(sourceB, "right", containerRect),
              getMatchAnchor(target, "left", containerRect),
            ),
          );
        }
      }

      setPaths(nextPaths);
      setSize({
        width: containerRect.width,
        height: containerRect.height,
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, rounds, knockoutResults]);

  return { paths, size };
}

function BracketColumnView({
  standingsByGroup,
  knockoutResults,
  startRound,
  onMatchClick,
}) {
  const rounds = useMemo(
    () => getKnockoutBracketRoundsFrom(startRound),
    [startRound],
  );
  const containerRef = useRef(null);
  const { paths, size } = useBracketConnectorLines(
    containerRef,
    rounds,
    knockoutResults,
  );
  const firstRoundCount = rounds[0]?.matchIds.length ?? 1;
  const totalRows = getBracketTotalRows(firstRoundCount);
  const gridTemplateColumns = rounds
    .map((_, roundIndex) =>
      roundIndex === 0
        ? "var(--knockout-card-width)"
        : "var(--knockout-connector-width) var(--knockout-card-width)",
    )
    .join(" ");

  return (
    <div
      className={`knockout-bracket knockout-bracket--lined knockout-bracket--from-${startRound}`}
      style={{ "--knockout-visible-columns": rounds.length }}
    >
      <div
        ref={containerRef}
        className="knockout-bracket-lanes"
        style={{
          gridTemplateColumns,
          gridTemplateRows: `repeat(${totalRows}, auto)`,
        }}
      >
        {paths.length > 0 && (
          <svg
            className="knockout-bracket-lines"
            width={size.width}
            height={size.height}
            aria-hidden="true"
          >
            {paths.map((path, index) => (
              <path
                key={`${path}-${index}`}
                className="knockout-bracket-line"
                d={path}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}

        {rounds.map((round, roundIndex) => (
          <Fragment key={round.round}>
            {roundIndex > 0 && (
              <div
                className="knockout-bracket-gutter"
                style={{
                  gridColumn: getBracketGutterColumn(roundIndex - 1),
                  gridRow: `1 / ${totalRows + 1}`,
                }}
              />
            )}
            {round.matchIds.map((matchId, matchIndex) => (
              <div
                key={matchId}
                className="knockout-bracket-slot"
                data-bracket-match={matchId}
                style={{
                  gridColumn: getBracketMatchColumn(roundIndex),
                  gridRow: getBracketGridRow(roundIndex, matchIndex) + 1,
                }}
              >
                <KnockoutMatchCard
                  matchId={matchId}
                  standingsByGroup={standingsByGroup}
                  knockoutResults={knockoutResults}
                  onMatchClick={onMatchClick}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

BracketColumnView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  startRound: PropTypes.oneOf(KNOCKOUT_ROUND_VIEWS).isRequired,
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
  const sections = getKnockoutListSectionsFromView(viewRound);

  if (sections.length > 1) {
    return (
      <div className="knockout-list-grouped">
        {sections.map(({ round, label, matchIds }) => (
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
  standingsByGroup,
  knockoutResults,
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
    <BracketColumnView
      standingsByGroup={standingsByGroup}
      knockoutResults={knockoutResults}
      startRound={viewRound}
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
  const [viewMode, setViewMode] = useState(readStoredKnockoutViewMode);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const isTreeView = viewMode === "tree";

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

      </div>

      <div
        className={`knockout-bracket-scroll${
          isTreeView ? "" : " knockout-bracket-scroll--list"
        }`}
        role="tabpanel"
        id={`knockout-panel-${viewRound}`}
        aria-labelledby={`knockout-tab-${viewRound}`}
      >
        {renderBracketContent({
          isTreeView,
          standingsByGroup,
          knockoutResults,
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
