import PropTypes from 'prop-types';
import { GROUP_LETTERS } from './utils/data';

export const teamShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.oneOf(GROUP_LETTERS),
  flagCode: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string),
  fifaRankingPreWc: PropTypes.number,
  confederation: PropTypes.string,
  founded: PropTypes.number,
  homeStadium: PropTypes.string,
});

export const playerShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired,
  flagCode: PropTypes.string,
  position: PropTypes.oneOf(['GK', 'DEF', 'MID', 'FWD']).isRequired,
  shirtNumber: PropTypes.number,
  club: PropTypes.string,
  age: PropTypes.number,
  heightCm: PropTypes.number,
  foot: PropTypes.string,
  caps: PropTypes.number,
  internationalGoals: PropTypes.number,
  wcAppearances: PropTypes.number,
  wcGoals: PropTypes.number,
  imageUrl: PropTypes.string,
  worldCups: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      role: PropTypes.string,
      goals: PropTypes.number,
      assists: PropTypes.number,
      minutesPlayed: PropTypes.number,
    })
  ),
});

export const squadShape = PropTypes.shape({
  coach: PropTypes.shape({
    name: PropTypes.string.isRequired,
    nationality: PropTypes.string,
  }).isRequired,
  captain: PropTypes.string,
  playerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const wcTournamentShape = PropTypes.shape({
  year: PropTypes.number.isRequired,
  host: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  stageLabel: PropTypes.string,
  squadPlayerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  penalties: PropTypes.shape({
    home: PropTypes.number,
    away: PropTypes.number,
  }),
  goals: PropTypes.arrayOf(goalShape),
  cards: PropTypes.arrayOf(cardShape),
});

export const groupIdType = PropTypes.oneOf(GROUP_LETTERS).isRequired;
