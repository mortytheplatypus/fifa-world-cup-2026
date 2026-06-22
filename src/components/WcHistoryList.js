import { useState } from 'react';
import PropTypes from 'prop-types';
import { fetchPlayers, resolvePlayers } from '../utils/data';
import { wcTournamentShape } from '../propTypes';
import WcHistorySquad from './WcHistorySquad';
import WcStageBadge from './WcStageBadge';

function WcHistoryList({ tournaments }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const [playersMap, setPlayersMap] = useState(null);

  if (!tournaments?.length) {
    return <p className="status-message">No previous World Cup appearances.</p>;
  }

  const sorted = [...tournaments].sort((a, b) => b.year - a.year);

  async function handleToggle(year) {
    if (expandedYear === year) {
      setExpandedYear(null);
      return;
    }

    if (!playersMap) {
      const players = await fetchPlayers();
      setPlayersMap(players);
    }

    setExpandedYear(year);
  }

  return (
    <ul className="wc-history-list">
      {sorted.map((tournament) => {
        const isExpanded = expandedYear === tournament.year;
        const squadPlayers = playersMap
          ? resolvePlayers(tournament.squadPlayerIds, playersMap)
          : [];

        return (
          <li key={tournament.year} className="wc-history-item">
            <button
              type="button"
              className={`wc-history-item-header${isExpanded ? ' wc-history-item-header--expanded' : ''}`}
              onClick={() => handleToggle(tournament.year)}
              aria-expanded={isExpanded}
            >
              <span className="wc-history-year">{tournament.year}</span>
              <span className="wc-history-host">{tournament.host}</span>
              <WcStageBadge stage={tournament.stage} label={tournament.stageLabel} />
              <span className="wc-history-toggle" aria-hidden="true">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
            {isExpanded && (
              <WcHistorySquad
                year={tournament.year}
                players={squadPlayers}
                loading={!playersMap}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

WcHistoryList.propTypes = {
  tournaments: PropTypes.arrayOf(wcTournamentShape),
};

export default WcHistoryList;
