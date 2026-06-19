import PropTypes from 'prop-types';
import { GROUP_LETTERS } from './utils/data';

export const teamShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.oneOf(GROUP_LETTERS),
  flagCode: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string),
});

export const goalShape = PropTypes.shape({
  minute: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  scorer: PropTypes.string.isRequired,
  team: PropTypes.oneOf(['home', 'away']).isRequired,
});

export const cardShape = PropTypes.shape({
  team: PropTypes.oneOf(['home', 'away']).isRequired,
  type: PropTypes.oneOf([
    'yellow',
    'secondYellow',
    'directRed',
    'yellowAndDirectRed',
  ]).isRequired,
  player: PropTypes.string,
  scorer: PropTypes.string,
  name: PropTypes.string,
  minute: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  isKnockout: PropTypes.bool,
  knockoutTag: PropTypes.string,
  round: PropTypes.string,
  homeScore: PropTypes.number,
  awayScore: PropTypes.number,
  goals: PropTypes.arrayOf(goalShape),
  cards: PropTypes.arrayOf(cardShape),
});

export const groupIdType = PropTypes.oneOf(GROUP_LETTERS).isRequired;
