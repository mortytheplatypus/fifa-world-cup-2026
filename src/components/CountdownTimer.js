import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function getRemainingMs(targetDate) {
  return Math.max(0, targetDate.getTime() - Date.now());
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function CountdownTimer({ targetDate, hideDaysWhenZero = false }) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(targetDate)
  );

  useEffect(() => {
    setRemainingMs(getRemainingMs(targetDate));
    const intervalId = setInterval(() => {
      setRemainingMs(getRemainingMs(targetDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (remainingMs <= 0) {
    return null;
  }

  const { days, hours, minutes, seconds } = formatCountdown(remainingMs);
  const showDays = !(hideDaysWhenZero && days === 0);

  return (
    <div className="countdown-timer" role="timer" aria-live="polite">
      {showDays && (
        <div className="countdown-unit">
          <span className="countdown-value">{days}</span>
          <span className="countdown-label">Days</span>
        </div>
      )}
      <div className="countdown-unit">
        <span className="countdown-value">
          {String(hours).padStart(2, '0')}
        </span>
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">
          {String(minutes).padStart(2, '0')}
        </span>
        <span className="countdown-label">Mins</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">
          {String(seconds).padStart(2, '0')}
        </span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  );
}

CountdownTimer.propTypes = {
  targetDate: PropTypes.instanceOf(Date).isRequired,
  hideDaysWhenZero: PropTypes.bool,
};

export default CountdownTimer;
