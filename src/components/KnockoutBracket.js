import PropTypes from 'prop-types';
import {
  BRACKET_TREE,
  KNOCKOUT_ROUND_LABELS,
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

  return (
    <div className={`knockout-match${compact ? ' knockout-match--compact' : ''}`}>
      <span className="knockout-match-id">{match.id}</span>
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

function BracketPair({ pair, standingsByGroup }) {
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
};

function BracketQuarter({ quarter, standingsByGroup }) {
  return (
    <div className="knockout-bracket-quarter">
      <div className="knockout-bracket-quarter-pairs">
        <BracketPair pair={quarter.pair1} standingsByGroup={standingsByGroup} />
        <BracketPair pair={quarter.pair2} standingsByGroup={standingsByGroup} />
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
};

function BracketHalf({ half, side, standingsByGroup }) {
  return (
    <div className={`knockout-bracket-half knockout-bracket-half--${side}`}>
      <div className="knockout-bracket-half-quarters">
        <BracketQuarter quarter={half.quarter1} standingsByGroup={standingsByGroup} />
        <BracketQuarter quarter={half.quarter2} standingsByGroup={standingsByGroup} />
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
};

function KnockoutBracket({ standingsByGroup }) {
  const { left, right, center } = BRACKET_TREE;

  return (
    <div className="knockout-bracket-scroll">
      <div className="knockout-bracket">
        <div className="knockout-bracket-round-labels">
          <span>{KNOCKOUT_ROUND_LABELS.r32}</span>
          <span>{KNOCKOUT_ROUND_LABELS.r16}</span>
          <span>{KNOCKOUT_ROUND_LABELS.qf}</span>
          <span>{KNOCKOUT_ROUND_LABELS.sf}</span>
          <span className="knockout-bracket-round-labels-center">
            {KNOCKOUT_ROUND_LABELS.final}
          </span>
        </div>

        <div className="knockout-bracket-tree">
          <BracketHalf half={left} side="left" standingsByGroup={standingsByGroup} />

          <div className="knockout-bracket-center">
            <KnockoutMatchCard
              matchId={center.final}
              standingsByGroup={standingsByGroup}
            />
            <KnockoutMatchCard
              matchId={center.third}
              standingsByGroup={standingsByGroup}
              compact
            />
          </div>

          <BracketHalf half={right} side="right" standingsByGroup={standingsByGroup} />
        </div>
      </div>
    </div>
  );
}

KnockoutBracket.propTypes = {
  standingsByGroup: standingsByGroupShape.isRequired,
};

export default KnockoutBracket;
