import { useEffect, useState } from 'react';
import { fetchFixtures, fetchTeams, groupTeamsByLetter } from '../utils/data';

export function useGroupsData() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [teamsData, fixturesData] = await Promise.all([
          fetchTeams(),
          fetchFixtures(),
        ]);
        if (!cancelled) {
          setTeams(teamsData);
          setFixtures(fixturesData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedTeams = groupTeamsByLetter(teams);

  return { teams, fixtures, groupedTeams, loading, error };
}
