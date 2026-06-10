import PropTypes from 'prop-types';

function ChevronIcon({ direction }) {
  return (
    <svg
      className="date-nav-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

ChevronIcon.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
};

function DateNavigator({ dateLabel, onPrevious, onNext, canGoPrevious, canGoNext }) {
  return (
    <div className="date-navigator">
      <button
        type="button"
        className={`date-nav-button${canGoPrevious ? '' : ' date-nav-button--inactive'}`}
        onClick={onPrevious}
        aria-label="Previous day"
        aria-disabled={!canGoPrevious}
      >
        <ChevronIcon direction="left" />
      </button>

      <span className="date-nav-label">{dateLabel}</span>

      <button
        type="button"
        className={`date-nav-button${canGoNext ? '' : ' date-nav-button--inactive'}`}
        onClick={onNext}
        aria-label="Next day"
        aria-disabled={!canGoNext}
      >
        <ChevronIcon direction="right" />
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
