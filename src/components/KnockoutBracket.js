import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  BRACKET_TREE,
  KNOCKOUT_ROUND_LABELS,
  KNOCKOUT_ROUND_VIEWS,
  getKnockoutMatchTag,
  formatKnockoutMatchDate,
  resolveKnockoutMatch,
} from '../utils/knockout';
import { isKnockoutTeamsRevealed } from '../utils/knockoutConfig';
import KnockoutTeamSlot from './KnockoutTeamSlot';

const revealTeams = isKnockoutTeamsRevealed();

const standingsByGroupShape = PropTypes.objectOf(
  PropTypes.arrayOf(
    PropTypes.shape({
      team: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        flagCode: PropTypes.string,
      }),
    })
  )
);

const knockoutResultsShape = PropTypes.objectOf(
  PropTypes.shape({
    homeScore: PropTypes.number,
    awayScore: PropTypes.number,
  })
);

function KnockoutMatchCard({ matchId, standingsByGroup, knockoutResults, compact }) {
  const match = resolveKnockoutMatch(matchId, standingsByGroup, {
    revealTeams,
    knockoutResults,
  });
  if (!match) return null;

  const tag = getKnockoutMatchTag(match.id);
  const dateLabel = formatKnockoutMatchDate(match.date);

  return (
    <div
      className={`knockout-match knockout-match--${match.round}${
        compact ? ' knockout-match--compact' : ''
      }`}
    >
      <div className="knockout-match-header">
        <div className="knockout-match-meta">
          <span className="knockout-match-id">{match.id}</span>
          {dateLabel && (
            <time className="knockout-match-date" dateTime={match.date}>
              {dateLabel}
            </time>
          )}
        </div>
        {tag && <span className="knockout-match-tag">{tag}</span>}
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

function BracketMergeConnector({ mirrored = false }) {
  return (
    <div
      className={`knockout-bracket-merge${mirrored ? ' knockout-bracket-merge--mirrored' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="knockout-bracket-merge-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          className="knockout-bracket-merge-path"
          d={mirrored ? 'M 50 25 V 75 M 50 50 H 0' : 'M 50 25 V 75 M 50 50 H 100'}
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

function BracketPair({ pair, standingsByGroup, knockoutResults, startRound, mirrored }) {
  if (startRound === 'qf' || startRound === 'sf') return null;

  if (startRound === 'r16') {
    return (
      <KnockoutMatchCard
        matchId={pair.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
      />
    );
  }

  return (
    <div className={`knockout-bracket-pair${mirrored ? ' knockout-bracket-pair--mirrored' : ''}`}>
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
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
  mirrored: PropTypes.bool,
};

BracketPair.defaultProps = {
  mirrored: false,
};

function BracketQuarter({ quarter, standingsByGroup, knockoutResults, startRound, mirrored }) {
  if (startRound === 'sf') return null;

  if (startRound === 'qf') {
    return (
      <KnockoutMatchCard
        matchId={quarter.r16}
        standingsByGroup={standingsByGroup}
        knockoutResults={knockoutResults}
      />
    );
  }

  return (
    <div className={`knockout-bracket-quarter${mirrored ? ' knockout-bracket-quarter--mirrored' : ''}`}>
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
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
  mirrored: PropTypes.bool,
};

BracketQuarter.defaultProps = {
  mirrored: false,
};

function BracketHalf({ half, side, standingsByGroup, knockoutResults, startRound }) {
  const mirrored = side === 'right';

  if (startRound === 'sf') {
    return (
      <div className={`knockout-bracket-half knockout-bracket-half--${side}`}>
        <KnockoutMatchCard
          matchId={half.sf}
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          compact
        />
      </div>
    );
  }

  return (
    <div
      className={`knockout-bracket-half knockout-bracket-half--${side}${
        mirrored ? ' knockout-bracket-half--mirrored' : ''
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
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
};

const BRACKET_SIDES = ['left', 'right'];

const BRACKET_SIDE_LABELS = {
  left: 'Left bracket',
  right: 'Right bracket',
};

const HALF_BRACKET_ROUNDS = ['r32', 'r16'];

function BracketHalfTreeView({ standingsByGroup, knockoutResults, bracketSide, startRound }) {
  const half = BRACKET_TREE[bracketSide];

  const isRight = bracketSide === 'right';

  return (
    <div
      className={`knockout-bracket knockout-bracket--half${
        isRight ? ' knockout-bracket--half-right' : ''
      }`}
    >
      <div
        className={`knockout-bracket-tree knockout-bracket-tree--half${
          isRight ? ' knockout-bracket-tree--half-right' : ''
        }`}
      >
        <BracketHalf
          half={half}
          side={bracketSide}
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
  startRound: PropTypes.oneOf(HALF_BRACKET_ROUNDS).isRequired,
};

function BracketTreeView({ standingsByGroup, knockoutResults, viewRound }) {
  const startRound = viewRound === 'finals' ? 'qf' : viewRound;
  const { left, right, center } = BRACKET_TREE;

  return (
    <div className={`knockout-bracket knockout-bracket--from-${startRound}`}>
      <div className="knockout-bracket-tree">
        <BracketHalf
          half={left}
          side="left"
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          startRound={startRound}
        />

        <div className="knockout-bracket-center">
          <KnockoutMatchCard
            matchId={center.final}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
          />
          <KnockoutMatchCard
            matchId={center.third}
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            compact
          />
        </div>

        <BracketHalf
          half={right}
          side="right"
          standingsByGroup={standingsByGroup}
          knockoutResults={knockoutResults}
          startRound={startRound}
        />
      </div>
    </div>
  );
}

BracketTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
  viewRound: PropTypes.oneOf(['finals']).isRequired,
};

function KnockoutBracket({ standingsByGroup, knockoutResults }) {
  const [viewRound, setViewRound] = useState('r32');
  const [bracketSide, setBracketSide] = useState('left');

  const showHalfBracket = HALF_BRACKET_ROUNDS.includes(viewRound);

  return (
    <div className="knockout-bracket-container">
      <div className="knockout-bracket-nav">
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
              className={`knockout-bracket-tab${viewRound === round ? ' active' : ''}`}
              aria-selected={viewRound === round}
              aria-controls={`knockout-panel-${round}`}
              title={KNOCKOUT_ROUND_LABELS[round]}
              onClick={() => setViewRound(round)}
            >
              {KNOCKOUT_ROUND_LABELS[round]}
            </button>
          ))}
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
                  bracketSide === side ? ' active' : ''
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
        className="knockout-bracket-scroll"
        role="tabpanel"
        id={showHalfBracket ? `knockout-side-panel-${bracketSide}` : `knockout-panel-${viewRound}`}
        aria-labelledby={
          showHalfBracket ? `knockout-side-tab-${bracketSide}` : `knockout-tab-${viewRound}`
        }
      >
        {showHalfBracket ? (
          <BracketHalfTreeView
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            bracketSide={bracketSide}
            startRound={viewRound}
          />
        ) : (
          <BracketTreeView
            standingsByGroup={standingsByGroup}
            knockoutResults={knockoutResults}
            viewRound={viewRound}
          />
        )}
      </div>
    </div>
  );
}

KnockoutBracket.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  knockoutResults: knockoutResultsShape.isRequired,
};

export default KnockoutBracket;
