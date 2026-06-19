import PropTypes from 'prop-types';
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
});

function KnockoutTeamSlot({ slot }) {
  if (slot.type === 'team' && slot.team) {
    return (
      <div className="knockout-slot knockout-slot--resolved">
        <img
          className="knockout-slot-flag"
          src={`https://flagcdn.com/w40/${slot.team.flagCode}.png`}
          alt=""
          width={22}
          height={16}
        />
        <span className="knockout-slot-name">
          {getTeamDisplayName(slot.team.name)}
          {slot.score != null ? (
            <span className="knockout-slot-score"> ({slot.score})</span>
          ) : (
            slot.code && <span className="knockout-slot-code"> {slot.code}</span>
          )}
        </span>
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
};

export default KnockoutTeamSlot;
