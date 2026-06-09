import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  DISPLAY_TIMEZONE,
  getBrowserTimezone,
  TIMEZONE_STORAGE_KEY,
} from '../utils/timezone';

const TimezoneContext = createContext(null);

function readStoredTimezone() {
  try {
    return localStorage.getItem(TIMEZONE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredTimezone(timeZone) {
  try {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, timeZone);
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }
}

export function TimezoneProvider({ children }) {
  const browserTimezone = getBrowserTimezone() ?? DISPLAY_TIMEZONE;
  const [timeZone, setTimeZone] = useState(
    () => readStoredTimezone() ?? browserTimezone
  );

  const updateTimeZone = useCallback((nextTimeZone) => {
    setTimeZone(nextTimeZone);
    writeStoredTimezone(nextTimeZone);
  }, []);

  const value = useMemo(
    () => ({
      timeZone,
      setTimeZone: updateTimeZone,
      browserTimezone,
    }),
    [timeZone, updateTimeZone, browserTimezone]
  );

  return (
    <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
  );
}

TimezoneProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
