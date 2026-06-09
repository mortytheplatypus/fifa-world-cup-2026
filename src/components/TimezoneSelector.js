import { useTimezone } from '../context/TimezoneContext';
import {
  formatTimezoneOptionLabel,
  getTimezoneSelectOptions,
} from '../utils/timezone';

function TimezoneSelector() {
  const { timeZone, setTimeZone, browserTimezone } = useTimezone();
  const options = getTimezoneSelectOptions(browserTimezone);

  return (
    <label className="timezone-selector">
      <span className="timezone-selector-label">Timezone</span>
      <select
        className="timezone-select"
        value={timeZone}
        onChange={(event) => setTimeZone(event.target.value)}
        aria-label="Select timezone for match times"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {formatTimezoneOptionLabel(option.value)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TimezoneSelector;
