import PropTypes from 'prop-types';
import {
  formatKnockoutMatchNumber,
  formatKnockoutMatchTag,
  parseKnockoutMatchTag,
} from '../utils/knockout';

function KnockoutMatchLabel({ tag, matchId, variant = 'split', className = '' }) {
  const parsed = parseKnockoutMatchTag(tag);
  const slotLabel = matchId
    ? formatKnockoutMatchNumber(matchId)
    : parsed?.label;

  if (!slotLabel) {
    return null;
  }

  if (variant === 'compact') {
    const label = formatKnockoutMatchTag(tag, matchId);
    return (
      <span className={`knockout-match-label knockout-match-label--compact ${className}`.trim()}>
        {label}
      </span>
    );
  }

  return (
    <span className={`knockout-match-label ${className}`.trim()}>
      {parsed?.round && (
        <span className="knockout-match-label-round">{parsed.round}</span>
      )}
      <span className="knockout-match-label-slot">{slotLabel}</span>
    </span>
  );
}

KnockoutMatchLabel.propTypes = {
  tag: PropTypes.string,
  matchId: PropTypes.string,
  variant: PropTypes.oneOf(['split', 'compact']),
  className: PropTypes.string,
};

export default KnockoutMatchLabel;
