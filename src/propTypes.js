import PropTypes from 'prop-types';
import { GROUP_LETTERS } from './utils/data';

export const teamShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.oneOf(GROUP_LETTERS),
  flagCode: PropTypes.string.isRequired,
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
});

export const groupIdType = PropTypes.oneOf(GROUP_LETTERS).isRequired;
