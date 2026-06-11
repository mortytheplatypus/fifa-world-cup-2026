import PropTypes from 'prop-types';
import { GROUP_LETTERS } from './utils/data';

export const teamShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.oneOf(GROUP_LETTERS),
  flagCode: PropTypes.string.isRequired,
});

export const goalShape = PropTypes.shape({
  minute: PropTypes.number.isRequired,
  scorer: PropTypes.string.isRequired,
  team: PropTypes.oneOf(['home', 'away']).isRequired,
});

export const fixtureShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  matchday: PropTypes.number.isRequired,
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  venue: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  group: PropTypes.oneOf(GROUP_LETTERS),
  homeScore: PropTypes.number,
  awayScore: PropTypes.number,
  goals: PropTypes.arrayOf(goalShape),
});

export const groupIdType = PropTypes.oneOf(GROUP_LETTERS).isRequired;
