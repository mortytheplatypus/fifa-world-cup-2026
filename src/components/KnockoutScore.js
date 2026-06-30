import PropTypes from 'prop-types';
import {
  getKnockoutScoreParts,
  isKnockoutPenaltyDecided,
} from '../utils/knockoutPenalties';

export function KnockoutScoreValue({ regulation, penalty, className }) {
  if (regulation == null) {
    return null;
  }

  return (
    <span className={className}>
      {regulation}
      {penalty != null && (
        <span className="knockout-score-penalty"> ({penalty})</span>
      )}
    </span>
  );
}

KnockoutScoreValue.propTypes = {
  regulation: PropTypes.number,
  penalty: PropTypes.number,
  className: PropTypes.string,
};

export function KnockoutScoreLine({
  result,
  separator = '–',
  className = '',
  valueClassName,
}) {
  if (result?.homeScore == null || result?.awayScore == null) {
    return null;
  }

  const home = getKnockoutScoreParts(result, 'home');
  const away = getKnockoutScoreParts(result, 'away');
  const penaltyDecided = isKnockoutPenaltyDecided(result);

  return (
    <span
      className={`${className}${
        penaltyDecided ? ' knockout-score-line--penalties' : ''
      }`.trim()}
    >
      <KnockoutScoreValue
        regulation={home.regulation}
        penalty={home.penalty}
        className={valueClassName}
      />
      <span className="knockout-score-separator" aria-hidden="true">
        {separator}
      </span>
      <KnockoutScoreValue
        regulation={away.regulation}
        penalty={away.penalty}
        className={valueClassName}
      />
    </span>
  );
}

KnockoutScoreLine.propTypes = {
  result: PropTypes.shape({
    homeScore: PropTypes.number,
    awayScore: PropTypes.number,
    penalties: PropTypes.shape({
      home: PropTypes.number,
      away: PropTypes.number,
    }),
  }),
  separator: PropTypes.string,
  className: PropTypes.string,
  valueClassName: PropTypes.string,
};
