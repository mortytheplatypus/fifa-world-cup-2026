import PropTypes from 'prop-types';

function DateNavigator({ dateLabel, onPrevious, onNext, canGoPrevious, canGoNext }) {
  return (
    <div className="date-navigator">
      <button
        type="button"
        className="date-nav-button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous day"
      >
        ←
      </button>

      <span className="date-nav-label">{dateLabel}</span>

      <button
        type="button"
        className="date-nav-button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}

DateNavigator.propTypes = {
  dateLabel: PropTypes.string.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  canGoPrevious: PropTypes.bool.isRequired,
  canGoNext: PropTypes.bool.isRequired,
};

export default DateNavigator;
