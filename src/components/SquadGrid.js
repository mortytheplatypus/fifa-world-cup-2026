import PropTypes from 'prop-types';
import { playerShape, teamShape } from '../propTypes';
import PlayerCard from './PlayerCard';

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'];

const POSITION_LABELS = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
};

function sortByShirtNumber(a, b) {
  const numA = a.shirtNumber ?? Number.MAX_SAFE_INTEGER;
  const numB = b.shirtNumber ?? Number.MAX_SAFE_INTEGER;
  if (numA !== numB) {
    return numA - numB;
  }
  return a.name.localeCompare(b.name);
}

function groupPlayersByPosition(players) {
  const groups = Object.fromEntries(POSITION_ORDER.map((position) => [position, []]));

  for (const player of players) {
    const bucket = groups[player.position];
    if (bucket) {
      bucket.push(player);
    }
  }

  for (const position of POSITION_ORDER) {
    groups[position].sort(sortByShirtNumber);
  }

  return POSITION_ORDER.map((position) => ({
    position,
    label: POSITION_LABELS[position],
    players: groups[position],
  })).filter((group) => group.players.length > 0);
}

function SquadGrid({ players, team }) {
  if (!players?.length) {
    return <p className="status-message">No squad data available.</p>;
  }

  const groups = groupPlayersByPosition(players);

  return (
    <div className="squad-sections">
      {groups.map(({ position, label, players: groupPlayers }) => (
        <section key={position} className="squad-section" aria-labelledby={`squad-${position}`}>
          <h2 id={`squad-${position}`} className="squad-section-title">
            <span className="squad-section-code">{position}</span>
            <span className="squad-section-label">{label}</span>
            <span className="squad-section-count">{groupPlayers.length}</span>
          </h2>
          <div className="squad-grid">
            {groupPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} team={team} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

SquadGrid.propTypes = {
  players: PropTypes.arrayOf(playerShape).isRequired,
  team: teamShape,
};

export default SquadGrid;
