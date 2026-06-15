import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  BRACKET_TREE,
  KNOCKOUT_ROUND_LABELS,
  KNOCKOUT_ROUND_VIEWS,
  getKnockoutMatchTag,
  resolveKnockoutMatch,
} from '../utils/knockout';
import { isKnockoutTeamsRevealed } from '../utils/knockoutConfig';
import KnockoutTeamSlot from './KnockoutTeamSlot';

const resolveOptions = { revealTeams: isKnockoutTeamsRevealed() };

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

function KnockoutMatchCard({ matchId, standingsByGroup, compact }) {
  const match = resolveKnockoutMatch(matchId, standingsByGroup, resolveOptions);
  if (!match) return null;

  const tag = getKnockoutMatchTag(match.id);

  return (
    <div className={`knockout-match${compact ? ' knockout-match--compact' : ''}`}>
      <div className="knockout-match-header">
        <span className="knockout-match-id">{match.id}</span>
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
  compact: PropTypes.bool,
};

function BracketPair({ pair, standingsByGroup, startRound }) {
  if (startRound === 'qf' || startRound === 'sf') return null;

  if (startRound === 'r16') {
    return (
      <KnockoutMatchCard
        matchId={pair.r16}
        standingsByGroup={standingsByGroup}
        compact
      />
    );
  }

  return (
    <div className="knockout-bracket-pair">
      <div className="knockout-bracket-pair-r32">
        {pair.r32.map((matchId) => (
          <KnockoutMatchCard
            key={matchId}
            matchId={matchId}
            standingsByGroup={standingsByGroup}
            compact
          />
        ))}
      </div>
      <div className="knockout-bracket-connector knockout-bracket-connector--r32-r16" />
      <KnockoutMatchCard
        matchId={pair.r16}
        standingsByGroup={standingsByGroup}
        compact
      />
    </div>
  );
}

BracketPair.propTypes = {
  pair: PropTypes.shape({
    r16: PropTypes.string.isRequired,
    r32: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  standingsByGroup: standingsByGroupShape.isRequired,
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
};

function BracketQuarter({ quarter, standingsByGroup, startRound }) {
  if (startRound === 'sf') return null;

  if (startRound === 'qf') {
    return (
      <KnockoutMatchCard
        matchId={quarter.r16}
        standingsByGroup={standingsByGroup}
        compact
      />
    );
  }

  return (
    <div className="knockout-bracket-quarter">
      <div className="knockout-bracket-quarter-pairs">
        <BracketPair pair={quarter.pair1} standingsByGroup={standingsByGroup} startRound={startRound} />
        <BracketPair pair={quarter.pair2} standingsByGroup={standingsByGroup} startRound={startRound} />
      </div>
      <div className="knockout-bracket-connector knockout-bracket-connector--r16-qf" />
      <KnockoutMatchCard
        matchId={quarter.r16}
        standingsByGroup={standingsByGroup}
        compact
      />
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
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
};

function BracketHalf({ half, side, standingsByGroup, startRound, flowLtr }) {
  const layoutSide = flowLtr ? 'left' : side;

  if (startRound === 'sf') {
    return (
      <div className={`knockout-bracket-half knockout-bracket-half--${layoutSide}`}>
        <KnockoutMatchCard
          matchId={half.sf}
          standingsByGroup={standingsByGroup}
          compact
        />
      </div>
    );
  }

  return (
    <div className={`knockout-bracket-half knockout-bracket-half--${layoutSide}`}>
      <div className="knockout-bracket-half-quarters">
        <BracketQuarter quarter={half.quarter1} standingsByGroup={standingsByGroup} startRound={startRound} />
        <BracketQuarter quarter={half.quarter2} standingsByGroup={standingsByGroup} startRound={startRound} />
      </div>
      <div className="knockout-bracket-connector knockout-bracket-connector--qf-sf" />
      <KnockoutMatchCard
        matchId={half.sf}
        standingsByGroup={standingsByGroup}
        compact
      />
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
  startRound: PropTypes.oneOf(['r32', 'r16', 'qf', 'sf']).isRequired,
  flowLtr: PropTypes.bool,
};

BracketHalf.defaultProps = {
  flowLtr: false,
};

const BRACKET_SIDES = ['left', 'right'];

const BRACKET_SIDE_LABELS = {
  left: 'Left bracket',
  right: 'Right bracket',
};

function R32HalfTreeView({ standingsByGroup, bracketSide }) {
  const half = BRACKET_TREE[bracketSide];

  return (
    <div className="knockout-bracket knockout-bracket--half">
      <div className="knockout-bracket-tree knockout-bracket-tree--half">
        <BracketHalf
          half={half}
          side={bracketSide}
          flowLtr
          standingsByGroup={standingsByGroup}
          startRound="r32"
        />
      </div>
    </div>
  );
}

R32HalfTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  bracketSide: PropTypes.oneOf(BRACKET_SIDES).isRequired,
};

function BracketTreeView({ standingsByGroup, viewRound }) {
  const { left, right, center } = BRACKET_TREE;

  return (
    <div className={`knockout-bracket knockout-bracket--from-${viewRound}`}>
      <div className="knockout-bracket-tree">
        <BracketHalf
          half={left}
          side="left"
          standingsByGroup={standingsByGroup}
          startRound={viewRound}
        />

        <div className="knockout-bracket-center">
          <KnockoutMatchCard matchId={center.final} standingsByGroup={standingsByGroup} />
          <KnockoutMatchCard
            matchId={center.third}
            standingsByGroup={standingsByGroup}
            compact
          />
        </div>

        <BracketHalf
          half={right}
          side="right"
          standingsByGroup={standingsByGroup}
          startRound={viewRound}
        />
      </div>
    </div>
  );
}

BracketTreeView.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
  viewRound: PropTypes.oneOf(['r16', 'qf', 'sf']).isRequired,
};

function KnockoutBracket({ standingsByGroup }) {
  const [viewRound, setViewRound] = useState('r32');
  const [r32Side, setR32Side] = useState('left');

  return (
    <div className="knockout-bracket-container">
      <div className="knockout-bracket-nav">
        <div className="knockout-bracket-tabs" role="tablist" aria-label="Knockout round">
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

        {viewRound === 'r32' && (
          <div className="knockout-bracket-tabs knockout-bracket-tabs--side" role="tablist" aria-label="Bracket side">
            {BRACKET_SIDES.map((side) => (
              <button
                key={side}
                type="button"
                role="tab"
                id={`knockout-side-tab-${side}`}
                className={`knockout-bracket-tab${r32Side === side ? ' active' : ''}`}
                aria-selected={r32Side === side}
                aria-controls={`knockout-side-panel-${side}`}
                onClick={() => setR32Side(side)}
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
        id={viewRound === 'r32' ? `knockout-side-panel-${r32Side}` : `knockout-panel-${viewRound}`}
        aria-labelledby={
          viewRound === 'r32' ? `knockout-side-tab-${r32Side}` : `knockout-tab-${viewRound}`
        }
      >
        {viewRound === 'r32' ? (
          <R32HalfTreeView standingsByGroup={standingsByGroup} bracketSide={r32Side} />
        ) : (
          <BracketTreeView standingsByGroup={standingsByGroup} viewRound={viewRound} />
        )}
      </div>
    </div>
  );
}

KnockoutBracket.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
};

export default KnockoutBracket;
