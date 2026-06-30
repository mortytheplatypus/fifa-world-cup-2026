import PropTypes from 'prop-types';
import ThirdPlaceSlotInfo from './ThirdPlaceSlotInfo';
import { getTeamDisplayName } from '../utils/data';

const resolvedSlotShape = PropTypes.shape({
  type: PropTypes.oneOf(['team', 'third', 'placeholder']).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    flagCode: PropTypes.string,
  }),
  label: PropTypes.string,
  code: PropTypes.string,
  score: PropTypes.number,
  penaltyScore: PropTypes.number,
  thirdPlaceInfo: PropTypes.shape({
    candidateGroups: PropTypes.arrayOf(PropTypes.string),
  }),
});

function KnockoutTeamSlot({
  slot,
  outcome = null,
  showSeedCode = false,
  showThirdPlaceInfo = false,
}) {
  if (slot.type === 'team' && slot.team) {
    const outcomeClass =
      outcome === 'winner'
        ? ' knockout-slot--winner'
        : outcome === 'eliminated'
          ? ' knockout-slot--eliminated'
          : '';
    const teamName = getTeamDisplayName(slot.team.name);
    const ariaLabel =
      outcome === 'winner'
        ? `${teamName}, winner`
        : outcome === 'eliminated'
          ? `${teamName}, eliminated`
          : teamName;

    return (
      <div
        className={`knockout-slot knockout-slot--resolved${outcomeClass}`}
        aria-label={ariaLabel}
      >
        <img
          className="knockout-slot-flag"
          src={`https://flagcdn.com/w40/${slot.team.flagCode}.png`}
          alt=""
          width={22}
          height={16}
        />
        <span className="knockout-slot-name-group" aria-hidden="true">
          <span className="knockout-slot-name">
            {teamName}
            {slot.code && showSeedCode && (
              <span className="knockout-slot-code"> {slot.code}</span>
            )}
          </span>
          {showThirdPlaceInfo &&
            slot.thirdPlaceInfo?.candidateGroups?.length > 0 && (
            <ThirdPlaceSlotInfo candidateGroups={slot.thirdPlaceInfo.candidateGroups} />
          )}
        </span>
        {slot.score != null && (
          <span className="knockout-slot-score-line" aria-hidden="true">
            <span className="knockout-slot-score">{slot.score}</span>
            {slot.penaltyScore != null && (
              <span className="knockout-score-penalty">
                {' '}
                ({slot.penaltyScore})
              </span>
            )}
          </span>
        )}
      </div>
    );
  }

  const modifier =
    slot.type === 'third' ? 'knockout-slot--third' : 'knockout-slot--placeholder';

  return (
    <div className={`knockout-slot ${modifier}`}>
      <span className="knockout-slot-label">{slot.label}</span>
    </div>
  );
}

KnockoutTeamSlot.propTypes = {
  slot: resolvedSlotShape.isRequired,
  outcome: PropTypes.oneOf(['winner', 'eliminated']),
  showSeedCode: PropTypes.bool,
  showThirdPlaceInfo: PropTypes.bool,
};

export default KnockoutTeamSlot;
