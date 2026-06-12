import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { fetchTeams } from '../utils/data';

function FavoriteTeamBanner() {
  const {
    showFavoriteTeamPrompt,
    setFavoriteTeamId,
    dismissFavoriteTeamPrompt,
  } = useSettings();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    if (!showFavoriteTeamPrompt) {
      return undefined;
    }

    let cancelled = false;

    fetchTeams()
      .then((data) => {
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setTeams(sorted);
          setSelectedTeamId(sorted[0]?.id ?? '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTeams([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showFavoriteTeamPrompt]);

  if (!showFavoriteTeamPrompt) {
    return null;
  }

  function handleSave() {
    if (selectedTeamId) {
      setFavoriteTeamId(selectedTeamId);
    }
  }

  return (
    <div className="favorite-team-banner" role="region" aria-label="Choose favorite team">
      <div className="favorite-team-banner-content">
        <p className="favorite-team-banner-text">
          Pick your favorite team to personalize fixtures and group views.
        </p>

        <div className="favorite-team-banner-actions">
          <select
            className="favorite-team-banner-select"
            value={selectedTeamId}
            onChange={(event) => setSelectedTeamId(event.target.value)}
            disabled={teams.length === 0}
            aria-label="Favorite team"
          >
            {teams.length === 0 ? (
              <option value="">Loading teams…</option>
            ) : (
              teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            className="favorite-team-banner-save"
            onClick={handleSave}
            disabled={!selectedTeamId}
          >
            Save
          </button>

          <button
            type="button"
            className="favorite-team-banner-dismiss"
            onClick={dismissFavoriteTeamPrompt}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default FavoriteTeamBanner;
